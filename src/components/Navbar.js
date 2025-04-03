import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../config';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './Navbar.css';
import EventHighlights from './EventHighlights';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="nav-logo">
          Event Management
        </Link>
      </div>

      <div className="nav-right">
        {user && userRole && (
          <>
            {userRole === 'faculty' && (
              <Link to="/create-event" className="create-event-btn">
                <i className="fas fa-plus"></i>
                <span>Create Event</span>
              </Link>
            )}
            <Link to="/highlights" className="highlights-btn">
              <i className="fas fa-star"></i>
              <span>Event Highlights</span>
            </Link>
          </>
        )}

        <div className="nav-auth">
          {user ? (
            <div className="profile-menu">
              <button 
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <i className="fas fa-user-circle"></i>
                <span>{user.email}</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="user-info">
                    <span className="user-email">{user.email}</span>
                    <span className="user-role">{userRole}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  {user && userRole && (
          <>
            {userRole === 'faculty' && (
                <Link to="/my-events" className="dropdown-item">
                <i className="fas fa-calendar-alt"></i>
                My Events
              </Link>
            )}
          </>
        )}
                

                  <Link to="/profile" className="dropdown-item">
                    <i className="fas fa-user"></i>
                    My Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 