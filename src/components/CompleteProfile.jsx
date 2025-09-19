import React, { useState, useEffect } from 'react';
import { getSchools } from '../firebase';

// Simple profile completion form for new users after Google login

export default function CompleteProfile({ userType = '', onComplete }) {
  const [form, setForm] = useState({
    name: '',
    userType: userType || '',
    schoolId: '',
    schoolAddress: '',
  });
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    if (form.userType === 'staff' || form.userType === 'student') {
      getSchools().then(setSchools);
    }
  }, [form.userType]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleUserTypeChange(e) {
    setForm({ ...form, userType: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.userType) {
      setError('Please fill all required fields.');
      return;
    }
    if (form.userType === 'school') {
      if (!form.name || !form.schoolAddress) {
        setError('Please fill all school details.');
        return;
      }
    }
    if (form.userType === 'staff') {
      if (!form.schoolId) {
        setError('Please select a school.');
        return;
      }
    }
    setError('');
    onComplete(form);
  }

  // If registering as a school, do not show userType dropdown, always set userType to 'school'
  if (form.userType === 'school') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="School Name"
          className="w-full p-2 border rounded"
        />
        <input
          name="schoolAddress"
          value={form.schoolAddress}
          onChange={handleChange}
          required
          placeholder="School Address"
          className="w-full p-2 border rounded"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">Complete Profile</button>
      </form>
    );
  }

  // If registering as staff, do not show userType dropdown, always set userType to 'staff'
  if (form.userType === 'staff') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Your Name"
          className="w-full p-2 border rounded"
        />
        <select
          name="schoolId"
          value={form.schoolId}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select School</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">Complete Profile</button>
      </form>
    );
  }

  // If registering as student, require school selection
  if (form.userType === 'student') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Your Name"
          className="w-full p-2 border rounded"
        />
        <select
          name="schoolId"
          value={form.schoolId}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select School</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">Complete Profile</button>
      </form>
    );
  }
}
