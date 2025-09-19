import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import SchoolDashboard from './pages/SchoolDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import OfflineFallback from './components/OfflineFallback';
import './App.css';

// Protected route component
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Update network status
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      console.log("Online status: ", navigator.onLine);
    };

    // Listen to the online status
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Specify how to clean up after this effect:
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);



  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard/school" 
            element={<PrivateRoute><SchoolDashboard isOnline={isOnline} /></PrivateRoute>} 

          />
          <Route 
            path="/dashboard/staff" 
            element={<PrivateRoute><StaffDashboard isOnline={isOnline} /></PrivateRoute>} 
          />
          <Route 
            path="/dashboard/student" 
            element={<PrivateRoute><StudentDashboard isOnline={isOnline} /></PrivateRoute>} 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
