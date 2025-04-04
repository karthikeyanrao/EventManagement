import React, { useState, useEffect } from 'react';
import { db } from '../config';
import { collection, getDocs, updateDoc, doc, arrayUnion, Timestamp } from 'firebase/firestore';
import './EventHighlights.css';

const EventHighlights = () => {
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchCompletedEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const querySnapshot = await getDocs(eventsRef);
        const currentDate = new Date();
        
        const currentDateStr = currentDate.toISOString().split('T')[0];
        const currentTimeStr = currentDate.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit'
        });

        const events = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            links: doc.data().links || [] // Initialize empty array if no links exist
          }))
          .filter(event => {
            return event.date < currentDateStr || 
                   (event.date === currentDateStr && event.endTime < currentTimeStr);
          });

        setCompletedEvents(events);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to fetch completed events: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedEvents();
  }, []);

  const handleAddLink = async (eventId) => {
    try {
      const url = prompt('Enter the link URL:');
      if (!url) return;

      const description = prompt('Enter a description for this link:');
      if (!description) return;

      const newLink = {
        url,
        description,
        addedAt: new Date().toISOString(), // Store as ISO string
        type: 'drive'
      };

      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        links: arrayUnion(newLink)
      });

      // Update local state
      setCompletedEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { ...event, links: [...(event.links || []), newLink] }
            : event
        )
      );

      alert('Link added successfully!');
    } catch (err) {
      console.error('Error adding link:', err);
      alert('Failed to add link: ' + err.message);
    }
  };

  const handleCardClick = (event) => {
    setSelectedEvent(event);
  };

  const closePopup = () => {
    setSelectedEvent(null);
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;
  if (completedEvents.length === 0) return <div className="no-events">No completed events found</div>;

  return (
    <div className="highlights-container">
      <h2>Event Highlights</h2>
      <div className="events-grid">
        {completedEvents.map(event => (
          <div 
            key={event.id} 
            className="highlight-card"
            onClick={() => handleCardClick(event)}
          >
            <div className="event-header">
              <div className="header-left">
                <h3>{event.title}</h3>
                <button
                className="add-link-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddLink(event.id);
                }}
                title="Add New Link"
              >
                <i className="fas fa-plus"></i>
              </button>
                <span className="category-tag">{event.category}</span>
              </div>
             
            </div>
            
            <div className="event-details">
              <p>
                <i className="far fa-calendar"></i>
                <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
              </p>
              <p>
                <i className="far fa-clock"></i>
                <strong>Time:</strong> {event.startTime} - {event.endTime}
              </p>
              <p>
                <i className="fas fa-map-marker-alt"></i>
                <strong>Venue:</strong> {event.venue}
              </p>
              <p>
                <i className="fas fa-users"></i>
                <strong>Attendees:</strong> {event.attendees?.length || 0} / {event.capacity}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedEvent && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <div className="popup-header">
              <h3>{selectedEvent.title} - Links</h3>
              <button className="close-btn" onClick={closePopup}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="popup-body">
              {selectedEvent.links && selectedEvent.links.length > 0 ? (
                <div className="popup-links">
                  {selectedEvent.links.map((link, index) => (
                    <div key={index} className="popup-link-item">
                      <div className="link-details">
                        <span className="link-description">{link.description}</span>
                        <span className="link-date">
                          {new Date(link.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="popup-link-btn"
                      >
                        <i className="fas fa-external-link-alt"></i>
                        Open Link
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-links">
                  <i className="fas fa-link-slash"></i>
                  <p>No links available for this event</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventHighlights;
