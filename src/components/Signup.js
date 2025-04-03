import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';
import './Signup.css';

console.log('Auth initialized:', auth);
console.log('DB initialized:', db);

console.log('Auth state:', auth);
if (!auth) {
  console.error('Auth is not initialized!');
}

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Add validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting signup process...');
      console.log('Auth object exists:', !!auth);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log('User created successfully:', userCredential.user.uid);

      // Create user document with role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString(),
        eventsCreated: [],
        eventsJoined: []
      });
      console.log('User document created in Firestore');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-container">
        <div className="signup-header">
          <h2>Create Account</h2>
          <p>Join EventHub to start managing events</p>
        </div>

        {error && (
          <div className="signup-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="signup-form-group">
            <input
              type="text"
              placeholder="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-form-group">
            <input
              type="email"
              placeholder="Email address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-form-group">
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="signup-form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-form-group">
            <select
              className="signup-role-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="signup-buttons">
            <button 
              type="submit" 
              className={`signup-submit-btn ${loading ? 'signup-loading' : ''}`}
              disabled={loading}
            >
              Create Account
            </button>
            <Link to="/login" className="signup-login-link">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
