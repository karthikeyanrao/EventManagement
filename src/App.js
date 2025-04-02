import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/EventDashboard';    
import LiveEvents from './components/LiveEvents';
import UpcomingEvents from './components/UpcomingEvents';
import CreateEvent from './components/CreateEvent';
import EventHighlights from './components/EventHighlights';
import Login from './components/Login';
import Signup from './components/Signup';
import { auth } from './config';
import { useAuthState } from 'react-firebase-hooks/auth';
import Navbar from './components/Navbar';
function App() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('Auth State Changed:', user); // This will log the user state
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/live-events" element={<LiveEvents />} />
        <Route path="/upcoming-events" element={<UpcomingEvents />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/highlights" element={<EventHighlights />} />
      </Routes>
    </Router>
  );
}

export default App;
