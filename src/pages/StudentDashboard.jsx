import React from 'react';
import { useNavigate } from 'react-router-dom';
import SwitchRole from '../components/SwitchRole';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { logOut } from '../firebase';

// --- Helper Icon Components ---
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm5-6a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm5 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" /></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M13 3a1 1 0 00-1.22-.995l-3.1 1.24a1 1 0 00-.56 1.485L9.58 6.5H5.53A2.5 2.5 0 003.07 9.07l1.19 3.33a2.5 2.5 0 002.39 1.76h4.7a2.5 2.5 0 002.39-1.76l1.19-3.33A2.5 2.5 0 0014.47 6.5h-4.05l1.46-1.77a1 1 0 00-.22-1.485l-3.1-1.24A1 1 0 008 3h5zM4.6 15a1 1 0 100 2h10.8a1 1 0 100-2H4.6z" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;

const ActionCard = ({ title, description, icon, color }) => (
    <div className={`group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6 flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
        <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-slate-500">{description}</p>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-6 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-transform duration-300">
            <ChevronRightIcon />
        </div>
    </div>
);


export default function StudentDashboard() {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const isOnline = useOnlineStatus();

    async function handleLogout() {
        try {
            await logOut();
            // No need to navigate; AuthContext and router will handle redirect
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    return (
        <div className="relative min-h-screen w-full bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="absolute top-0 right-0 -translate-y-1/3 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-0 translate-x-1/3 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

            <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Student Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome, {userProfile?.displayName || 'Student'}! Let the learning adventure begin.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                        {!isOnline && (
                                            <span className="text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                                                Offline Mode
                                            </span>
                                        )}
                    <SwitchRole />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <main className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard 
                    title="Start a Quiz"
                    description="Test your knowledge and earn points."
                    icon={<PlayIcon />}
                    color="bg-indigo-100 text-indigo-600"
                />
                 <ActionCard 
                    title="Learning Zone"
                    description="Explore new topics and materials."
                    icon={<BookOpenIcon />}
                    color="bg-emerald-100 text-emerald-600"
                />
                 <ActionCard 
                    title="My Progress"
                    description="Track your scores and achievements."
                    icon={<ChartBarIcon />}
                    color="bg-amber-100 text-amber-600"
                />
                 <ActionCard 
                    title="Leaderboard"
                    description="See how you rank among your peers."
                    icon={<TrophyIcon />}
                    color="bg-sky-100 text-sky-600"
                />
            </main>
        </div>
    );
}
