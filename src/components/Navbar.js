import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config';
import { signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-container')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          <i className="fas fa-calendar-alt"></i>
          <span>EventHub</span>
        </Link>
      </div>

      <div className="nav-right">
        <Link to="/highlights" className="nav-btn btn-highlight">
          <i className="fas fa-star"></i>
          Event Highlights
        </Link>
        <Link to="/create-event" className="nav-btn btn-create">
          <i className="fas fa-plus"></i>
          Create Event
        </Link>

        {user ? (
          <div className="profile-container">
            <button 
              className="profile-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileOpen(!isProfileOpen);
              }}
            >
              <i className="fas fa-user-circle"></i>
              <span>{user.email}</span>
              <i className={`fas fa-chevron-${isProfileOpen ? 'up' : 'down'}`}></i>
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <i className="fas fa-user"></i>
                  <span>{user.email}</span>
                </div>
                <Link to="/profile" className="dropdown-item">
                  <i className="fas fa-id-card"></i>
                  <span>My Profile</span>
                </Link>
                <Link to="/my-events" className="dropdown-item">
                  <i className="fas fa-calendar"></i>
                  <span>My Events</span>
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-btn btn-login">
            <i className="fas fa-sign-in-alt"></i>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 