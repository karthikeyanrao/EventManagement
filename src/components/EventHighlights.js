import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const EventHighlights = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    // Load events from localStorage
    const storedEvents = JSON.parse(localStorage.getItem('events') || '[]');
    // Add highlights array to each event if it doesn't exist
    const eventsWithHighlights = storedEvents.map(event => ({
      ...event,
      highlights: event.highlights || []
    }));
    setEvents(eventsWithHighlights);
  }, []);

  const handleHighlightUpload = (eventId) => (e) => {
    const files = Array.from(e.target.files);
    const updatedEvents = [...events];
    const eventIndex = updatedEvents.findIndex(event => event.id === eventId);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newHighlight = {
          id: Date.now(),
          image: reader.result,
          uploadedAt: new Date().toISOString()
        };

        updatedEvents[eventIndex].highlights = [
          ...(updatedEvents[eventIndex].highlights || []),
          newHighlight
        ];
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="highlights-page">
      <div className="highlights-header">
        <h1>Event Highlights</h1>
        <p>Browse and upload photos from our amazing events</p>
      </div>

      <div className="events-highlights-grid">
        {events.map((event) => (
          <motion.div
            key={event.id}
            className="event-highlight-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="event-highlight-header">
              <img 
                src={event.bannerImage} 
                alt={event.title}
                className="event-banner"
              />
              <div className="event-info">
                <h2>{event.title}</h2>
                <p>
                  <i className="far fa-calendar"></i>
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="highlights-container">
              {event.highlights && event.highlights.length > 0 ? (
                <div className="highlights-grid">
                  {event.highlights.map((highlight) => (
                    <motion.div
                      key={highlight.id}
                      className="highlight-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img src={highlight.image} alt="Event highlight" />
                      <div className="highlight-overlay">
                        <span>{new Date(highlight.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="no-highlights">
                  <i className="fas fa-images"></i>
                  <p>No highlights yet</p>
                </div>
              )}
            </div>

            <div className="upload-section">
              <button 
                className="upload-highlights-btn"
                onClick={() => document.getElementById(`highlight-upload-${event.id}`).click()}
              >
                <i className="fas fa-upload"></i>
                Upload Highlights
              </button>
              <input
                type="file"
                id={`highlight-upload-${event.id}`}
                hidden
                multiple
                accept="image/*"
                onChange={handleHighlightUpload(event.id)}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventHighlights;
