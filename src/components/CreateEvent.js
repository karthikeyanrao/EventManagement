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
    // Normalize the venue names by removing spaces and making lowercase
    const normalizeVenue = (venue) => venue.toLowerCase().replace(/\s+/g, '').trim();
    const newVenue = normalizeVenue(formData.venue);
    const newDate = formData.date;
    
    // Convert times to minutes for easier comparison
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStartMinutes = timeToMinutes(formData.startTime);
    const newEndMinutes = timeToMinutes(formData.endTime);

    const conflicts = existingEvents.filter(event => {
      // Check if same date and venue first
      if (event.date === newDate && normalizeVenue(event.venue) === newVenue) {
        const existingStartMinutes = timeToMinutes(event.startTime);
        const existingEndMinutes = timeToMinutes(event.endTime);

        // Check for any overlap in time ranges
        const hasOverlap = (
          (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) || // New event starts during existing event
          (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) || // New event ends during existing event
          (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes) // New event completely encompasses existing event
        );

        return hasOverlap;
      }
      return false;
    });

    return conflicts;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate end time is after start time
    const startMinutes = timeToMinutes(formData.startTime);
    const endMinutes = timeToMinutes(formData.endTime);
    
    if (endMinutes <= startMinutes) {
      setError('End time must be after start time');
      return;
    }

    // Check for conflicts
    const conflicts = checkConflicts();
    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      setError(
        `Cannot create event: Venue "${formData.venue}" is already booked on ${formData.date} from ${conflict.startTime} to ${conflict.endTime} for event "${conflict.title}". Please choose a different time or venue.`
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

  // Helper function to convert time to minutes
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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

        <button type="submit" className="submit-btn">
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent; 