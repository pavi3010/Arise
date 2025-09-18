import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../firebase';
import { useNavigate } from 'react-router-dom';

import { SpeedInsights } from "@vercel/speed-insights/next"

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Arise Learning Platform</h1>
          <div className="flex items-center space-x-4">
            {currentUser?.photoURL && (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-full" 
              />
            )}
            <span className="text-gray-700">{currentUser?.displayName || currentUser?.email}</span>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
      
      <SpeedInsights/>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Learning Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Learning Modules</h3>
            <div className="space-y-4">
              {/* Example learning module */}
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition">
                <h4 className="font-medium">Introduction to Mathematics</h4>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full w-1/4"></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">25% Complete</p>
              </div>
              
              {/* Example learning module */}
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition">
                <h4 className="font-medium">Basic Science Concepts</h4>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full w-1/2"></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">50% Complete</p>
              </div>
              
              {/* Example learning module */}
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition">
                <h4 className="font-medium">Language Arts</h4>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full w-3/4"></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">75% Complete</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="text-center p-4">
                <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-medium">Overall Progress</h4>
                <p className="text-3xl font-bold text-blue-600 mt-2">50%</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Achievements</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Quick Learner</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Math Whiz</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Science Explorer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;