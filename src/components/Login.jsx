import { useState, useEffect } from 'react';
import { signInWithGoogle, checkUserExists, createUserInFirestore } from '../firebase';
import { createSchool } from '../services/school.service';
import CompleteProfile from './CompleteProfile';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SchoolIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);

const StaffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const StudentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
    </svg>
);

function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    // Only redirect if userProfile and userType are present
    if (currentUser && userProfile && userProfile.userType) {
      redirectToDashboard(userProfile.userType);
    }
    // If user is logged in but no userProfile/userType, let onboarding/profile complete UI show
  }, [currentUser, userProfile]);

  function redirectToDashboard(role) {
    if (role === 'school') navigate('/dashboard/school');
    else if (role === 'staff' || role === 'teacher') navigate('/dashboard/staff');
    else if (role === 'student') navigate('/dashboard/student');
    else navigate('/dashboard');
  }

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
    if (pendingUser && pendingUser.roles && pendingUser.roles.includes(role)) {
      localStorage.setItem('ariseUser', JSON.stringify({ ...pendingUser, userType: role }));
      redirectToDashboard(role);
    } else {
      setShowCompleteProfile(true);
    }
  }

  async function handleCompleteProfile(formData) {
    if (!pendingUser) return;
    let newRoles = pendingUser.roles ? [...pendingUser.roles] : [];
    if (!newRoles.includes(formData.userType)) newRoles.push(formData.userType);
    let schoolId = formData.schoolId;
    if (formData.userType === 'school') {
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

  const PageWrapper = ({ children }) => (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
            {children}
        </div>
    </div>
  );

  if (pendingUser && (!selectedRole || showCompleteProfile)) {
    if (showCompleteProfile) {
      return (
        <PageWrapper>
          <h1 className="text-3xl font-bold text-center text-slate-800">
            Complete Your Profile
          </h1>
          <p className="text-center text-slate-500 pb-4">A few more details to get you started.</p>
          <CompleteProfile userType={selectedRole || userType || 'student'} onComplete={handleCompleteProfile} />
        </PageWrapper>
      );
    }
    
    const allRoles = [
        { key: 'student', name: 'Student', icon: <StudentIcon />, description: "Let's start learning!" },
        { key: 'staff', name: 'Staff / Teacher', icon: <StaffIcon />, description: 'Manage and teach.' },
        { key: 'school', name: 'School Admin', icon: <SchoolIcon />, description: 'Administer your school.' },
    ];
    
    return (
      <PageWrapper>
        <h1 className="text-3xl font-bold text-center text-slate-800">Select Your Role</h1>
        <p className="text-center text-slate-500 pb-4">How will you be using the Arise platform?</p>
        <div className="flex flex-col gap-4">
          {allRoles.map(role => (
            <button 
              key={role.key} 
              onClick={() => handleRoleSelect(role.key)} 
              className="group flex items-center w-full p-4 space-x-4 text-left bg-white/70 rounded-2xl shadow-md border-2 border-transparent hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <div className="flex-shrink-0">{role.icon}</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{role.name}</h2>
                <p className="text-sm text-slate-600">{role.description}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 ml-auto transform group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
        <div className="flex justify-center mb-4">
            <svg className="w-20 h-20 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
      <h1 className="text-4xl font-bold text-center text-slate-800">Arise Learning Platform</h1>
      <p className="text-center text-slate-500 mt-2">A gamified learning experience for students in Odisha</p>
      
      {error && (
        <div className="p-3 mt-4 text-sm text-center text-red-800 bg-red-100 rounded-lg" role="alert">
            {error}
        </div>
      )}

      <div className="pt-6">
        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-slate-700 bg-white rounded-xl shadow-md border-2 border-transparent hover:shadow-lg hover:border-indigo-500 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform"
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>
      </div>
    </PageWrapper>
  );
}

export default Login;

