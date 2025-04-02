import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  return (
    <div className="event-card">
      <h3>{event.name}</h3>
      <p>{event.description}</p>
      <div>
        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
        <span>📍 {event.venue}</span>
      </div>
      <Link to={`/events/${event.id}`}>View Details</Link>
    </div>
  );
};

export default EventCard; 