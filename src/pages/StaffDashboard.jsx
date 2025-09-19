
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SwitchRole from '../components/SwitchRole';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { logOut } from '../firebase';
import { getSchoolGrades, getGradeSections, addSectionStudent } from '../services/school.service';

// --- Helper Icon Components ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;

const Card = ({ title, icon, children, className }) => (
    <div className={`bg-white/60 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6 ${className}`}>
        {title && (
             <div className="flex items-center mb-4 text-xl font-bold text-slate-700">
                <div className="mr-3 text-indigo-500">{icon}</div>
                <h2>{title}</h2>
            </div>
        )}
        <div className="space-y-4">
            {children}
        </div>
    </div>
);


export default function StaffDashboard() {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const isOnline = useOnlineStatus();
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState({});
    const [studentInputs, setStudentInputs] = useState({});
    const [loading, setLoading] = useState(false);
    const schoolId = userProfile?.schoolId;
    const userId = userProfile?.id;

    async function handleLogout() {
        try {
            await logOut();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    // Fetch grades and sections on mount
    useEffect(() => {
        if (!schoolId) return;
        getSchoolGrades(schoolId).then(async gradesList => {
            setGrades(gradesList);
            const allSections = {};
            for (const grade of gradesList) {
                allSections[grade.id] = await getGradeSections(schoolId, grade.id);
            }
            setSections(allSections);
        });
    }, [schoolId]);

    // Add student to section
    async function handleAddStudent(gradeId, sectionId) {
        const { name, email } = studentInputs[sectionId] || {};
        if (!name || !email) return;
        setLoading(true);
        await addSectionStudent(schoolId, gradeId, sectionId, { displayName: name, email });
        setStudentInputs(inputs => ({ ...inputs, [sectionId]: { name: '', email: '' } }));
        // Optionally refresh sections if you want to show student list
        setLoading(false);
    }

    // Find all sections where current user is incharge
    const inchargeSections = [];
    grades.forEach(grade => {
        (sections[grade.id] || []).forEach(section => {
            if (section.incharge === userId) {
                inchargeSections.push({ grade, section });
            }
        });
    });

    return (
        <div className="relative min-h-screen w-full bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

                        <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center mb-8">
                                <div>
                                        <h1 className="text-3xl font-bold text-slate-800">Staff Dashboard</h1>
                                        <p className="text-slate-500 mt-1">Welcome, {userProfile?.displayName || ''}!</p>
                                </div>
                                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                        {!isOnline && (
                                            <span className="text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                                                Offline Mode
                                            </span>
                                        )}
                                        <SwitchRole />
                                        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Logout</button>
                                </div>
                        </header>

            <main className="relative z-10">
                <Card title="Your Sections" icon={<ClipboardListIcon />}>
                    {loading ? (
                        <p className="text-center text-slate-500">Loading your sections...</p>
                    ) : inchargeSections.length > 0 ? (
                        <div className="space-y-6">
                            {inchargeSections.map(({ grade, section }) => (
                                <div key={section.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
                                    <h3 className="text-lg font-bold text-slate-700">
                                        Grade {grade.name} - Section {section.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">Add new students to your section below.</p>

                                    <form className="space-y-3 sm:space-y-0 sm:flex sm:gap-2" onSubmit={e => { e.preventDefault(); handleAddStudent(grade.id, section.id); }}>
                                        <input
                                            type="text"
                                            placeholder="Student Full Name"
                                            value={studentInputs[section.id]?.name || ''}
                                            onChange={e => setStudentInputs(inputs => ({ ...inputs, [section.id]: { ...inputs[section.id], name: e.target.value } }))}
                                            className="w-full flex-grow bg-white/70 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                            disabled={loading}
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Student Email"
                                            value={studentInputs[section.id]?.email || ''}
                                            onChange={e => setStudentInputs(inputs => ({ ...inputs, [section.id]: { ...inputs[section.id], email: e.target.value } }))}
                                            className="w-full flex-grow bg-white/70 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                            disabled={loading}
                                            required
                                        />
                                        <button type="submit" className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition" disabled={loading}>
                                           <PlusIcon /> Student
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <InfoIcon />
                            <h3 className="mt-2 text-lg font-medium text-slate-800">No sections assigned</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                You are not currently in charge of any sections. Please contact your school admin.
                            </p>
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
}

