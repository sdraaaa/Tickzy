import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import HostDashboard from './pages/HostDashboard';
import CreateEvent from './pages/CreateEvent';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="user" element={<UserDashboard />} />
            <Route path="event/:id" element={<EventDetails />} />
            <Route path="profile" element={<Profile />} />
            <Route path="host" element={<HostDashboard />} />
            <Route path="host/create" element={<CreateEvent />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;