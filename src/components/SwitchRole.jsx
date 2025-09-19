import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SwitchRole() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('ariseUser') || '{}');
  const roles = user.roles || [];
  const currentRole = user.userType;

  function handleSwitch(role) {
    localStorage.setItem('ariseUser', JSON.stringify({ ...user, userType: role }));
    setShow(false);
    if (role === 'school') navigate('/dashboard/school');
    else if (role === 'staff' || role === 'teacher') navigate('/dashboard/staff');
    else if (role === 'student') navigate('/dashboard/student');
    else navigate('/dashboard');
  }

  if (!roles || roles.length < 2) return null;

  return (
    <div className="inline-block ml-2">
      <button onClick={() => setShow(s => !s)} className="px-3 py-1 bg-gray-200 rounded text-sm">Switch Role</button>
      {show && (
        <div style={{ position: 'fixed', zIndex: 9999, left: '50%', top: '70px', transform: 'translateX(-50%)' }}
          className="bg-white border rounded shadow p-2 mt-2 min-w-[160px]">
          <div className="mb-2 text-xs text-gray-500">Switch to:</div>
          {roles.filter(r => r !== currentRole).map(role => (
            <button key={role} onClick={() => handleSwitch(role)} className="block w-full text-left px-2 py-1 hover:bg-blue-100 rounded">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}