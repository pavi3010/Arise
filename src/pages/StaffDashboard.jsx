import React from 'react';

import { useNavigate } from 'react-router-dom';
import SwitchRole from '../components/SwitchRole';

export default function StaffDashboard() {
  const navigate = useNavigate();
  function handleLogout() {
    localStorage.removeItem('ariseUser');
    navigate('/login');
  }
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <SwitchRole />
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
      </div>
      <p>Welcome, Staff! Here you can view your assigned classes and subjects.</p>
      {/* Add staff features here */}
    </div>
  );
}
