import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Load events from localStorage
    const storedEvents = JSON.parse(localStorage.getItem('events') || '[]');
    // Filter for upcoming events
    const upcomingEvents = storedEvents.filter(event => {
      const eventDate = new Date(`${event.date} ${event.time}`);
      return eventDate > new Date();
    });
    setEvents(upcomingEvents);
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Upcoming Events</h2>
      <div style={styles.eventGrid}>
        {events.length === 0 ? (
          <p style={styles.noEvents}>No upcoming events found</p>
        ) : (
          events.map(event => (
            <div key={event.id} style={styles.eventCard}>
              <h3 style={styles.eventTitle}>{event.title}</h3>
              <p style={styles.eventDescription}>{event.description}</p>
              <div style={styles.eventDetails}>
                <p>📅 {event.date} at {event.time}</p>
                <p>📍 {event.venue}</p>
                <p>👥 Max Participants: {event.maxParticipants}</p>
                <p>🏷️ Category: {event.category}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heading: {
    color: '#C41E3A',
    marginBottom: '20px',
  },
  eventGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  eventTitle: {
    color: '#C41E3A',
    marginBottom: '10px',
  },
  eventDescription: {
    color: '#666',
    marginBottom: '15px',
  },
  eventDetails: {
    color: '#333',
    '& p': {
      margin: '5px 0',
    },
  },
  noEvents: {
    textAlign: 'center',
    color: '#666',
    gridColumn: '1 / -1',
  },
  createButton: {
    display: 'inline-block',
    backgroundColor: '#C41E3A',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    textDecoration: 'none',
    marginTop: '20px',
  },
};

export default UpcomingEvents; 