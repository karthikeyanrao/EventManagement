import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [existingEvents, setExistingEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    capacity: '',
    registrationDeadline: '',
    organizer: '',
    contactEmail: '',
    imageUrl: ''
  });
  const [error, setError] = useState('');

  // Fetch existing events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const querySnapshot = await getDocs(eventsRef);
        const events = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExistingEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Check for time and venue conflicts
  const checkConflicts = () => {
    const newEventStart = new Date(`${formData.date}T${formData.startTime}`);
    const newEventEnd = new Date(`${formData.date}T${formData.endTime}`);

    const conflicts = existingEvents.filter(event => {
      const existingStart = new Date(`${event.date}T${event.startTime}`);
      const existingEnd = new Date(`${event.date}T${event.endTime}`);

      // Check if dates are the same
      if (event.date !== formData.date) return false;

      // Check if venues are the same
      if (event.venue.toLowerCase() !== formData.venue.toLowerCase()) return false;

      // Check for time overlap
      return (
        (newEventStart >= existingStart && newEventStart < existingEnd) ||
        (newEventEnd > existingStart && newEventEnd <= existingEnd) ||
        (newEventStart <= existingStart && newEventEnd >= existingEnd)
      );
    });

    return conflicts;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate end time is after start time
    const startTime = new Date(`2000-01-01T${formData.startTime}`);
    const endTime = new Date(`2000-01-01T${formData.endTime}`);
    
    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    // Check for conflicts
    const conflicts = checkConflicts();
    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(event => 
        `"${event.title}" (${event.startTime} - ${event.endTime})`
      ).join(', ');
      
      setError(`There are scheduling conflicts with the following events at this venue: ${conflictDetails}`);
      return;
    }

    try {
      const eventData = {
        ...formData,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        status: 'upcoming',
        attendees: []
      };
      
      // Add event to Firebase
      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log('Event created with ID:', docRef.id);
      
      navigate('/');
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user makes changes
    setError('');
  };

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h1>Create Your Event</h1>
        <p>Let's make something amazing together</p>
      </div>

      <div className="progress-bar">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">
            <span>Basic Details</span>
            <small>Event information</small>
          </div>
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">
            <span>Date & Venue</span>
            <small>When & where</small>
          </div>
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">
            <span>Additional Info</span>
            <small>Final touches</small>
          </div>
        </div>
      </div>

      <div className="create-event-form">
        {step === 1 && (
          <div className="form-step">
            <div className="form-group">
              <label>Event Title</label>
              <input
                type="text"
                name="title"
                placeholder="Give your event a catchy title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Tell people what your event is about"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="technical">Technical</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Venue</label>
              <input
                type="text"
                name="venue"
                placeholder="Enter event venue"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                placeholder="Maximum number of attendees"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <div className="form-group">
              <label>Registration Deadline</label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Organizer Name</label>
              <input
                type="text"
                name="organizer"
                placeholder="Who's organizing this event?"
                value={formData.organizer}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                placeholder="Email for inquiries"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Event Banner Image URL</label>
              <input
                type="url"
                name="imageUrl"
                placeholder="Paste image URL here"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <div className="form-navigation">
          {step > 1 && (
            <button type="button" className="btn-previous" onClick={handlePrevious}>
              <i className="fas fa-arrow-left"></i>
              Previous
            </button>
          )}
          
          {step < 3 ? (
            <button type="button" className="btn-next" onClick={handleNext}>
              Next
              <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button type="button" className="btn-submit" onClick={handleSubmit}>
              Create Event
              <i className="fas fa-check"></i>
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEvent; 