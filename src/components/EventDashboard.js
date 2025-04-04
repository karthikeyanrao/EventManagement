import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { db } from '../config';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import './EventDashboard.css';
import '../index.css';


const RegistrationForm = ({ event, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    department: '',
    year: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="registration-modal">
      <div className="registration-content">
        <h3>Register for {event.title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rollNo">Roll Number</label>
            <input
              id="rollNo"
              type="text"
              value={formData.rollNo}
              onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              required
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
              required
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">Submit</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventDashboard = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('upcoming');

  const categories = [
    { id: 'all', name: 'All Events', icon: 'fa-calendar-alt' },
    { id: 'academic', name: 'Academic', icon: 'fa-graduation-cap' },
    { id: 'cultural', name: 'Cultural', icon: 'fa-theater-masks' },
    { id: 'technical', name: 'Technical', icon: 'fa-laptop-code' },
    { id: 'sports', name: 'Sports', icon: 'fa-basketball-ball' },
    { id: 'workshops', name: 'Workshops', icon: 'fa-chalkboard-teacher' }
  ];

  const statusFilters = [
    { id: 'all', name: 'All', icon: 'fa-list' },
    { id: 'upcoming', name: 'Upcoming', icon: 'fa-clock' },
    { id: 'live', name: 'Live', icon: 'fa-broadcast-tower' },
    { id: 'ended', name: 'Ended', icon: 'fa-check-circle' }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, orderBy('date', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: getEventStatus(doc.data())
        }));
        
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);



  // Updated getEventStatus function
  const getEventStatus = (event) => {
    const now = new Date().getTime();
    const eventDate = new Date(`${event.date} ${event.startTime}`).getTime();
    const eventEndDate = new Date(`${event.date} ${event.endTime}`).getTime();

    if (now > eventEndDate) {
      return 'ended';
    } else if (now >= eventDate && now <= eventEndDate) {
      return 'live';
    } else {
      return 'upcoming';
    }
  };

  // Binary Search Implementation
  const binarySearchEvents = (sortedEvents, query) => {
    const results = [];
    const searchLower = query.toLowerCase();
    
    for (let event of sortedEvents) {
      if (event.title.toLowerCase().includes(searchLower)) {
        results.push(event);
      }
    }
    
    return results;
  };

  // Merge Sort Implementation
  const mergeSort = (arr, criteria) => {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    return merge(
      mergeSort(left, criteria),
      mergeSort(right, criteria),
      criteria
    );
  };

  const merge = (left, right, criteria) => {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (compareEvents(left[leftIndex], right[rightIndex], criteria) <= 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  };

  const compareEvents = (a, b, criteria) => {
    switch (criteria) {
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  };

  // Use useMemo to prevent unnecessary recalculations
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Apply search using binary search if there's a search query
    if (searchQuery) {
      filtered = binarySearchEvents(filtered, searchQuery);
    }

    // Sort the filtered results by date using merge sort
    return mergeSort(filtered, 'date');
  }, [events, selectedCategory, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time function
  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate time remaining
  const getTimeRemaining = (deadline) => {
    const now = new Date().getTime();
    const timeLeft = new Date(deadline).getTime() - now;
    
    if (timeLeft <= 0) return 'Deadline passed';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    if (hours > 0) return `${hours} hours left`;
    return 'Less than an hour left';
  };

  const handleRegister = async (eventId, participantData) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const event = events.find(e => e.id === eventId);
      
      if (!event) return;

      // Check if capacity is reached
      if (event.participants?.length >= event.capacity) {
        alert('Sorry, this event has reached its maximum capacity.');
        return;
      }

      // Check if participant already registered
      if (event.participants?.some(p => p.rollNo === participantData.rollNo)) {
        alert('You have already registered for this event.');
        return;
      }

      // Add participant to event
      const updatedParticipants = [...(event.participants || []), {
        ...participantData,
        registeredAt: new Date().toISOString()
      }];

      await updateDoc(eventRef, {
        participants: updatedParticipants
      });

      // Update local state
      setEvents(events.map(e => 
        e.id === eventId 
          ? {...e, participants: updatedParticipants}
          : e
      ));

      setShowRegistrationForm(false);
      alert('Registration successful!');
    } catch (error) {
      console.error('Error registering:', error);
      alert('Failed to register. Please try again.');
    }
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  // Filter events based on status
  const getFilteredEvents = () => {
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const currentTimeStr = currentDate.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit'
    });

    return events.filter(event => {
      const eventDate = event.date;
      const eventStartTime = event.startTime;
      const eventEndTime = event.endTime;

      if (filterStatus === 'live') {
        return eventDate === currentDateStr && 
               eventStartTime <= currentTimeStr && 
               eventEndTime >= currentTimeStr;
      } else if (filterStatus === 'upcoming') {
        return eventDate > currentDateStr || 
               (eventDate === currentDateStr && eventStartTime > currentTimeStr);
      } else if (filterStatus === 'ended') {
        return eventDate < currentDateStr || 
               (eventDate === currentDateStr && eventEndTime < currentTimeStr);
      }
      return true;
    });
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Events Dashboard</h1>
          </div>

        <div className="hero-section">
          <div className="hero-content">
            <h1>Discover Amazing College Events</h1>
            <p>Find and create events that matter to you</p>
          </div>

          <div className="quick-stats">
            <div className="stat-card">
              <i className="fas fa-calendar stat-icon"></i>
              <div className="stat-info">
                <h3>{events.length}</h3>
                <p>Total Events</p>
              </div>
            </div>

            <div className="stat-card">
              <i className="fas fa-users stat-icon"></i>
              <div className="stat-info">
                <h3>{events.filter(e => e.status === 'upcoming').length}</h3>
                <p>Upcoming Events</p>
              </div>
            </div>

            <div className="stat-card">
              <i className="fas fa-play-circle stat-icon"></i>
              <div className="stat-info">
                <h3>{events.filter(e => e.status === 'live').length}</h3>
                <p>Live Now</p>
              </div>
            </div>

            <div className="stat-card">
              <i className="fas fa-chart-line stat-icon"></i>
              <div className="stat-info">
                <h3>{events.filter(e => {
                  const eventDate = new Date(e.date);
                  const thisMonth = new Date().getMonth();
                  return eventDate.getMonth() === thisMonth;
                }).length}</h3>
                <p>This Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Navigation Actions */}
        <div className="dashboard-actions">
        <div className="filter-buttons">
            <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
            >
                <i className="fas fa-th-large"></i>
                All Events
            </button>
            <button 
                className={`filter-btn ${filterStatus === 'live' ? 'active' : ''}`}
                onClick={() => setFilterStatus('live')}
            >
                <i className="fas fa-circle live-icon"></i>
                Live Events
            </button>
            <button 
                className={`filter-btn ${filterStatus === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilterStatus('upcoming')}
            >
                <i className="fas fa-calendar-alt"></i>
                Upcoming
            </button>
            <button 
                className={`filter-btn ${filterStatus === 'ended' ? 'active' : ''}`}
                onClick={() => setFilterStatus('ended')}
            >
                <i className="fas fa-check-circle"></i>
                Ended
            </button>
        </div>
        
        </div>

        {/* Search and Filter Section */}
        <section className="search-filter-section">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </section>

        {/* Events Grid */}
        <section className="events-section">
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading events...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          ) : (
            <div className="events-grid">
              {getFilteredEvents().length > 0 ? (
                getFilteredEvents().map((event, index) => (
                  <motion.div
                    key={event.id}
                    className={`event-card ${event.status}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="event-image">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        onError={(e) => {
                          e.target.src = '/default-event-image.jpg';
                        }}
                      />
                      <div className={`status-badge ${event.status}`}>
                        {event.status === 'live' && <div className="pulse"></div>}
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </div>
                    </div>
                    <div className="event-content">
                      <div className="event-header">
                        <h3 className="event-title">{event.title}</h3>
                        <p className="event-description">{event.description}</p>
                        <span className={`category-tag ${event.category}`}>
                          {event.category}
                        </span>
                      </div>
                      <div className="event-details">
                        <div className="detail">
                          <i className="fas fa-calendar-alt"></i>
                          <div className="detail-text">
                            <small>Date</small>
                            <span>{formatDate(event.date)}</span>
                          </div>
                        </div>
                        
                        <div className="detail">
                          <i className="fas fa-clock"></i>
                          <div className="detail-text">
                            <small>Time</small>
                            <span>
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="detail">
                          <i className="fas fa-map-marker-alt"></i>
                          <div className="detail-text">
                            <small>Venue</small>
                            <span>{event.venue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="duration-badge">
                        <i className="fas fa-hourglass-half"></i>
                        <span>
                          {(() => {
                            const start = new Date(`2000-01-01T${event.startTime}`);
                            const end = new Date(`2000-01-01T${event.endTime}`);
                            const diff = (end - start) / (1000 * 60); // minutes
                            const hours = Math.floor(diff / 60);
                            const minutes = diff % 60;
                            return `${hours}h ${minutes}m duration`;
                          })()}
                        </span>
                      </div>
                      <div className="deadline-info">
                        <i className="fas fa-hourglass-half"></i>
                        <div className="deadline-text">
                          <small>Registration Deadline</small>
                          <span>{getTimeRemaining(event.registrationDeadline)}</span>
                        </div>
                      </div>
                      <div className="event-footer">
                        <div className="participants-info">
                          <div className="participant-count">
                            <i className="fas fa-users"></i>
                            <span>{event.participants?.length || 0} registered</span>
                          </div>
                          <small>
                            {event.capacity - (event.participants?.length || 0)} spots left
                          </small>
                        </div>

                        {event.status !== 'ended' && !isDeadlinePassed(event.registrationDeadline) && (
                          <button 
                            className="register-btn"
                            onClick={() => {
                              console.log('Register button clicked');
                              setSelectedEvent(event);
                              setShowRegistrationForm(true);
                            }}
                            disabled={
                              (event.participants?.length || 0) >= event.capacity
                            }
                          >
                            {(event.participants?.length || 0) >= event.capacity 
                              ? 'Full' 
                              : 'Register'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="no-events">
                  <i className="fas fa-calendar-times"></i>
                  <p>No events found</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {showRegistrationForm && selectedEvent && (
        <RegistrationForm
          event={selectedEvent}
          onClose={() => {
            setShowRegistrationForm(false);
            setSelectedEvent(null);
          }}
          onSubmit={(formData) => handleRegister(selectedEvent.id, formData)}
        />
      )}
    </div>
  );
};

export default EventDashboard; 
