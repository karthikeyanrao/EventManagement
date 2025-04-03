import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
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

  // Add formatTime function here
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

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

  const checkTimeConflict = () => {
    const getMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStartMinutes = getMinutes(formData.startTime);
    const newEndMinutes = getMinutes(formData.endTime);
    const newVenue = formData.venue.toLowerCase().trim();
    const newDate = formData.date;

    const conflicts = existingEvents.filter(event => {
      if (event.date !== newDate || event.venue.toLowerCase().trim() !== newVenue) {
        return false;
      }

      const existingStart = getMinutes(event.startTime);
      const existingEnd = getMinutes(event.endTime);

      return (
        (newStartMinutes >= existingStart && newStartMinutes < existingEnd) ||
        (newEndMinutes > existingStart && newEndMinutes <= existingEnd) ||
        (newStartMinutes <= existingStart && newEndMinutes >= existingEnd)
      );
    });

    return conflicts;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.title || !formData.date || !formData.startTime || 
        !formData.endTime || !formData.venue || !formData.capacity) {
      setError('Please fill in all required fields');
      return;
    }

    // Check if end time is after start time
    const startTime = new Date(`2000-01-01T${formData.startTime}`);
    const endTime = new Date(`2000-01-01T${formData.endTime}`);
    
    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    // Check for venue and time conflicts
    const conflicts = checkTimeConflict();
    if (conflicts.length > 0) {
      const conflictMessages = conflicts.map(conflict => 
        `• "${conflict.title}" (${formatTime(conflict.startTime)} - ${formatTime(conflict.endTime)})`
      ).join('\n');

      setError(
        `Cannot create event due to scheduling conflicts at ${formData.venue} on ${formData.date}:\n\n` +
        `${conflictMessages}\n\n` +
        `Please choose a different time or venue.`
      );
      return;
    }

    try {
      const eventData = {
        ...formData,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        status: 'upcoming',
        participants: []
      };
      
      await addDoc(collection(db, 'events'), eventData);
      alert('Event created successfully!');
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
    setError(''); // Clear error when user makes changes
  };

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h2>Create New Event</h2>
      </div>

      <form className="create-event-form" onSubmit={handleSubmit}>
        {/* Event Title */}
        <div className="input-group">
          <label className="input-label">Event Title</label>
          <input
            type="text"
            name="title"
            className="input-field"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="input-group">
          <label className="input-label">Description</label>
          <textarea
            name="description"
            className="input-field"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category */}
        <div className="input-group">
          <label className="input-label">Category</label>
          <select
            name="category"
            className="input-field"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="academic">Academic</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        {/* Date and Time */}
        <div className="datetime-container">
          <div className="input-group">
            <label className="input-label">Date</label>
            <input
              type="date"
              name="date"
              className="input-field"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Start Time</label>
            <input
              type="time"
              name="startTime"
              className="input-field"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">End Time</label>
            <input
              type="time"
              name="endTime"
              className="input-field"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Venue */}
        <div className="input-group">
          <label className="input-label">Venue</label>
          <input
            type="text"
            name="venue"
            className="input-field"
            value={formData.venue}
            onChange={handleChange}
            required
          />
        </div>

        {/* Capacity and Registration Deadline */}
        <div className="capacity-deadline-container">
          <div className="input-group">
            <label className="input-label">Maximum Capacity</label>
            <input
              type="number"
              name="capacity"
              className="input-field"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Registration Deadline</label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              className="input-field"
              value={formData.registrationDeadline}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="input-group">
          <label className="input-label">Event Image URL</label>
          <input
            type="url"
            name="imageUrl"
            className="input-field"
            value={formData.imageUrl}
            onChange={handleChange}
          />
        </div>

        <div className="form-footer">
          {error && (
            <div className="error-container">
              <div className="error-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="error-content">
                <h4>Error</h4>
                {error.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}
          
          <button type="submit" className="submit-btn">
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent; 