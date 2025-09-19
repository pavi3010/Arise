import { useState, useEffect } from 'react';
import { signInWithGoogle, checkUserExists, createUserInFirestore } from '../firebase';
import { createSchool } from '../services/school.service';
import CompleteProfile from './CompleteProfile';
import { useNavigate } from 'react-router-dom';
// import { getSchools } from '../services/school.service'; // to be implemented


function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]); // e.g. ['student', 'staff']
  const [selectedRole, setSelectedRole] = useState('');
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  // On mount, do not auto-redirect. Always require Google login and role selection.
  useEffect(() => {
    // No-op: do not auto-redirect based on localStorage
  }, []);

  function redirectToDashboard(role) {
    if (role === 'school') navigate('/dashboard/school');
    else if (role === 'staff' || role === 'teacher') navigate('/dashboard/staff');
    else if (role === 'student') navigate('/dashboard/student');
    else navigate('/dashboard');
  }

  // useEffect(() => {
  //   // Fetch schools for staff registration (to be implemented)
  //   getSchools().then(setSchools);
  // }, []);


  function handleUserTypeChange(type) {
    setUserType(type);
    setError('');
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      const user = await signInWithGoogle();
      if (!user) return;
      // Always prompt for role selection, even if user exists
      const userDoc = await checkUserExists(user.uid);
      setPendingUser(userDoc || user);
      setUserRoles(userDoc?.roles || []);
      setShowCompleteProfile(false);
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }


  function handleRoleSelect(role) {
    setSelectedRole(role);
    // If user already has this role, just redirect
    if (pendingUser && pendingUser.roles && pendingUser.roles.includes(role)) {
      localStorage.setItem('ariseUser', JSON.stringify({ ...pendingUser, userType: role }));
      redirectToDashboard(role);
    } else {
      // Otherwise, show complete profile for new role
      setShowCompleteProfile(true);
    }
  }

  async function handleCompleteProfile(formData) {
    if (!pendingUser) return;
    let newRoles = pendingUser.roles ? [...pendingUser.roles] : [];
    if (!newRoles.includes(formData.userType)) newRoles.push(formData.userType);
    let schoolId = formData.schoolId;
    if (formData.userType === 'school') {
      // Create a new school and use its id
      schoolId = await createSchool({ name: formData.name, address: formData.schoolAddress });
    }
    if (formData.userType === 'staff' && !schoolId) {
      alert('School selection required for staff');
      return;
    }
    const userDoc = {
      ...pendingUser,
      ...formData,
      roles: newRoles,
      userType: formData.userType,
      schoolId: schoolId
    };
    await createUserInFirestore(pendingUser.uid, userDoc);
    localStorage.setItem('ariseUser', JSON.stringify(userDoc));
    setShowCompleteProfile(false);
    redirectToDashboard(formData.userType);
  }

  // After Google login, always show role selection
  if (pendingUser && (!selectedRole || showCompleteProfile)) {
    // If user is registering a new role, show complete profile
    if (showCompleteProfile) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
          <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Complete Your Profile</h1>
            <CompleteProfile userType={selectedRole || userType || 'student'} onComplete={handleCompleteProfile} />
          </div>
        </div>
      );
    }
    // Otherwise, show role selection
    const allRoles = ['school', 'staff', 'student'];
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Select Your Role</h1>
          <div className="flex flex-col gap-2">
            {allRoles.map(role => (
              <button key={role} onClick={() => handleRoleSelect(role)} className="px-4 py-2 bg-blue-500 text-white rounded">{role.charAt(0).toUpperCase() + role.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: show Google login
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">Arise Learning Platform</h1>
        <p className="text-center text-gray-600">A gamified learning experience for students</p>
        {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="flex items-center justify-center w-full px-4 py-2 mt-2 space-x-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>
      </div>
    </div>
  );
}

export default Login;