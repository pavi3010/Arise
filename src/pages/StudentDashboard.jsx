import React from 'react';

import { useNavigate } from 'react-router-dom';
import SwitchRole from '../components/SwitchRole';

export default function StudentDashboard() {
  const navigate = useNavigate();
  function handleLogout() {
    localStorage.removeItem('ariseUser');
    navigate('/login');
  }
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <SwitchRole />
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
      </div>
      <p>Welcome, Student! Here you can access your quizzes and learning materials.</p>
      {/* Add student features here */}
    </div>
  );
}
