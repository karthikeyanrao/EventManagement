import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/');
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        default:
          setError('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-box"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <h1>Welcome to EventHub</h1>
            <p>Your one-stop platform for college events</p>
          </div>

          {error && (
            <motion.div 
              className="error-alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <div className="input-icon">
               
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-icon">
               
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-buttons">
              <button type="submit" className="login-btn">
                Login
              </button>
              <Link to="/signup" className="create-account-btn">
                Create Account
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
