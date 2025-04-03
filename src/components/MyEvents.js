import React, { useState, useEffect } from 'react';
import { auth, db } from '../config';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './MyEvents.css';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const navigate = useNavigate();

  // Define fetchMyEvents before using it in useEffect
  const fetchMyEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('createdBy', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const eventsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setEditFormData(event);
    setShowEditModal(true);
  };

  const handleViewParticipants = (event) => {
    setSelectedEvent(event);
    setShowParticipantsModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const eventRef = doc(db, 'events', selectedEvent.id);
      await updateDoc(eventRef, editFormData);
      setShowEditModal(false);
      fetchMyEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <div className="my-events-container">
      <div className="header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
        <h2 className="page-title">All Events</h2>
      </div>

      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <div className={`status-badge ${event.status}`}>
              {event.status}
            </div>
            
            <h3 className="event-title">{event.title}</h3>
            <span className={`category-tag ${event.category}`}>
              {event.category}
            </span>

            <div className="event-details">
              <div className="detail-item">
                <i className="fas fa-calendar"></i>
                <div className="detail-content">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{event.date}</span>
                </div>
              </div>

              <div className="detail-item">
                <i className="fas fa-clock"></i>
                <div className="detail-content">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">
                    {event.startTime} - {event.endTime}
                  </span>
                </div>
              </div>

              <div className="detail-item">
                <i className="fas fa-map-marker-alt"></i>
                <div className="detail-content">
                  <span className="detail-label">Venue</span>
                  <span className="detail-value">{event.venue}</span>
                </div>
              </div>

              <div className="detail-item">
                <i className="fas fa-hourglass-half"></i>
                <div className="detail-content">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{event.duration}</span>
                </div>
              </div>
            </div>

            <div className="event-actions">
              <button className="edit-btn" onClick={() => handleEdit(event)}>
                Edit Details
              </button>
              <button className="view-btn" onClick={() => handleViewParticipants(event)}>
                View Participants
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Event</h3>
            <form onSubmit={handleUpdateEvent}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  placeholder="Enter event title"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="academic">Academic</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={editFormData.startTime}
                  onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={editFormData.endTime}
                  onChange={(e) => setEditFormData({...editFormData, endTime: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input
                  type="text"
                  value={editFormData.venue}
                  onChange={(e) => setEditFormData({...editFormData, venue: e.target.value})}
                  placeholder="Enter venue"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipantsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Registered Participants</h3>
            <div className="participants-list">
              {selectedEvent?.participants?.length > 0 ? (
                selectedEvent.participants.map((participant, index) => (
                  <div key={index} className="participant-item">
                    <p><strong>Name:</strong> {participant.name}</p>
                    <p><strong>Roll No:</strong> {participant.rollNo}</p>
                  </div>
                ))
              ) : (
                <p>No participants registered yet.</p>
              )}
            </div>
            <div className="modal-actions">
              <button className="close-btn" onClick={() => setShowParticipantsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
