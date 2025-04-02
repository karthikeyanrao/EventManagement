import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = {
  // Event endpoints
  getEvents: () => axios.get(`${API_URL}/events`),
  getEventById: (id) => axios.get(`${API_URL}/events/${id}`),
  getUpcomingEvents: () => axios.get(`${API_URL}/events/upcoming`),
  getPastEvents: () => axios.get(`${API_URL}/events/past`),
  searchEvents: (query) => axios.get(`${API_URL}/events/search?query=${query}`),
  createEvent: (eventData) => axios.post(`${API_URL}/events`, eventData),
  updateEvent: (id, eventData) => axios.put(`${API_URL}/events/${id}`, eventData),
  deleteEvent: (id) => axios.delete(`${API_URL}/events/${id}`),
  
  // User endpoints
  createUser: (userData) => axios.post(`${API_URL}/users`, userData),
  getUserById: (id) => axios.get(`${API_URL}/users/${id}`),
  getUserEvents: (id) => axios.get(`${API_URL}/users/${id}/events`),
  
  // Registration endpoints
  registerForEvent: (eventId, userId) => 
    axios.post(`${API_URL}/events/${eventId}/register/${userId}`),
  unregisterFromEvent: (eventId, userId) => 
    axios.delete(`${API_URL}/events/${eventId}/unregister/${userId}`)
};

export default api; 