import React, { useState, useEffect } from 'react';
import { auth, db } from '../config';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './MyEvents.css';

// Queue Implementation for Event Updates
class UpdateQueue {
  constructor() {
    this.items = [];
  }

  enqueue(event) {
    this.items.push(event);
  }

  dequeue() {
    if(this.isEmpty()) return null;
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  peek() {
    if(this.isEmpty()) return null;
    return this.items[0];
  }
}

// Hash Table Implementation for Quick Event Lookup
class EventHashTable {
  constructor() {
    this.table = {};
    this.size = 0;
  }

  // Hash Function
  hash(eventId) {
    let hash = 0;
    for (let i = 0; i < eventId.length; i++) {
      hash += eventId.charCodeAt(i);
    }
    return hash;
  }

  // Add or Update Event
  set(event) {
    const hash = this.hash(event.id);
    this.table[hash] = event;
    this.size++;
  }

  // Get Event
  get(eventId) {
    const hash = this.hash(eventId);
    return this.table[hash];
  }

  // Remove Event
  remove(eventId) {
    const hash = this.hash(eventId);
    delete this.table[hash];
    this.size--;
  }

  // Clear Hash Table
  clear() {
    this.table = {};
    this.size = 0;
  }
}

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updateQueue] = useState(new UpdateQueue());
  const [eventHashTable] = useState(new EventHashTable());
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('createdBy', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const eventsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Store events in hash table for quick lookup
      eventsList.forEach(event => {
        eventHashTable.set(event);
      });
      
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleEdit = (event) => {
    // Quick event lookup using hash table
    const eventToEdit = eventHashTable.get(event.id);
    if (eventToEdit) {
      setSelectedEvent(eventToEdit);
      setEditFormData(eventToEdit);
      setShowEditModal(true);
    }
  };

  const processUpdateQueue = async () => {
    while (!updateQueue.isEmpty()) {
      const eventToUpdate = updateQueue.dequeue();
      try {
        const eventRef = doc(db, 'events', eventToUpdate.id);
        await updateDoc(eventRef, eventToUpdate);
        // Update hash table after successful update
        eventHashTable.set(eventToUpdate);
      } catch (error) {
        console.error('Error updating event:', error);
        // Re-queue failed updates
        updateQueue.enqueue(eventToUpdate);
        break;
      }
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    // Add update to queue
    updateQueue.enqueue({ ...editFormData });
    setShowEditModal(false);
    
    // Process updates
    await processUpdateQueue();
    // Refresh events list
    fetchMyEvents();
  };

  const handleViewParticipants = (event) => {
    // Quick event lookup using hash table
    const eventToView = eventHashTable.get(event.id);
    if (eventToView) {
      setSelectedEvent(eventToView);
      setShowParticipantsModal(true);
    }
  };

  return (
    <div className="my-events-container">
      <div className="header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
        <h2 className="page-title">My Events</h2>
        {updateQueue.size() > 0 && (
          <div className="update-badge">
            {updateQueue.size()} updates pending
          </div>
        )}
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
                <div className="detail-row">
                  <i className="fas fa-calendar"></i>
                  <div className="detail-content">
                    <span className="detail-value">{event.date}</span>
                  </div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-row">
                  <i className="fas fa-clock"></i>
                  <div className="detail-content">
                    <span className="detail-value">
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-row">
                  <i className="fas fa-map-marker-alt"></i>
                  <div className="detail-content">
                    <span className="detail-value">{event.venue}</span>
                  </div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-row">
                  <i className="fas fa-users"></i>
                  <div className="detail-content">
                    <span className={`detail-value ${event.participants?.length >= event.capacity ? 'full' : ''}`}>
                      {event.participants?.length || 0}/{event.capacity}
                      {event.participants?.length >= event.capacity && <span className="status-full"> (Full)</span>}
                    </span>
                  </div>
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
