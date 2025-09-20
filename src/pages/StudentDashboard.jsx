
import OfflineQuiz from './OfflineQuiz';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import SwitchRole from '../components/SwitchRole';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { logOut } from '../firebase';

// --- Helper Icon Components ---
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
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
    const [sectionInfo, setSectionInfo] = React.useState(null);
    const [inchargeInfo, setInchargeInfo] = React.useState(null);
    const [subjectTeachers, setSubjectTeachers] = React.useState([]);
    const [gradeName, setGradeName] = React.useState('');
    const [loadingInfo, setLoadingInfo] = React.useState(true);

    React.useEffect(() => {
        async function fetchSectionDetails() {
            if (!userProfile?.schoolId || !userProfile?.gradeId || !userProfile?.sectionId) {
                setLoadingInfo(false);
                return;
            }
            setLoadingInfo(true);
            try {
                const { getGradeSections, getSchoolUsers, getSchoolGrades } = await import('../services/school.service');
                // Get section info
                const sections = await getGradeSections(userProfile.schoolId, userProfile.gradeId);
                const section = sections.find(sec => sec.id === userProfile.sectionId);
                setSectionInfo(section);
                // Get all users for lookup
                const users = await getSchoolUsers(userProfile.schoolId);
                // Incharge info
                let incharge = null;
                if (section?.incharge) {
                    incharge = users.find(u => u.id === section.incharge);
                }
                setInchargeInfo(incharge);
                // Subject teachers
                let teachers = [];
                if (Array.isArray(section?.subjects)) {
                    teachers = section.subjects.map(subj => {
                        let teacher = null;
                        if (subj.teacherId) {
                            teacher = users.find(u => u.id === subj.teacherId);
                        } else if (subj.teacherEmail) {
                            teacher = users.find(u => u.email === subj.teacherEmail);
                        }
                        return {
                            subject: subj.name || subj.subjectName || 'Subject',
                            teacher: teacher
                        };
                    });
                }
                setSubjectTeachers(teachers);
                // Get grade name
                const grades = await getSchoolGrades(userProfile.schoolId);
                const grade = grades.find(g => g.id === userProfile.gradeId);
                setGradeName(grade ? grade.name : userProfile.gradeId);
            } catch (err) {
                setSectionInfo(null);
                setInchargeInfo(null);
                setSubjectTeachers([]);
            }
        }
        fetchSectionDetails();
    }, [userProfile]);

    const handleLogout = async () => {
        await logOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e1e8fc]">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-2">Welcome back, {userProfile?.firstName}!</h1>
                        <p className="text-sm sm:text-base text-slate-600">Grade: <span className="font-semibold text-slate-800">{gradeName}</span></p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white shadow-md hover:bg-red-600 transition-all duration-300"
                        >
                            <LogoutIcon className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* --- OFFLINE QUIZ SECTION --- */}
                <div className="mb-12">
                    <OfflineQuiz />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ActionCard
                        title="Continue Learning"
                        description="Pick up where you left off in your quizzes and lessons."
                        icon={<PlayIcon className="w-8 h-8 text-white" />}
                        color="bg-green-500"
                    />
                    <ActionCard
                        title="View Offline Quizzes"
                        description="Access and manage your downloaded quizzes."
                        icon={<BookOpenIcon className="w-8 h-8 text-white" />}
                        color="bg-blue-500"
                    />
                    <ActionCard
                        title="Track Your Progress"
                        description="Monitor your learning progress and achievements."
                        icon={<ChartBarIcon className="w-8 h-8 text-white" />}
                        color="bg-purple-500"
                    />
                    <ActionCard
                        title="Achievements"
                        description="View your earned badges and certificates."
                        icon={<TrophyIcon className="w-8 h-8 text-white" />}
                        color="bg-yellow-500"
                    />
                </div>

                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Subjects and Teachers</h2>
                    {loadingInfo ? (
                        <p className="text-slate-500">Loading information...</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {subjectTeachers.length === 0 ? (
                                    <p className="text-slate-500 col-span-2">No subjects found for your section.</p>
                            ) : (
                                subjectTeachers.map((subj, idx) => (
                                    <div key={idx} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-slate-100">
                                            <BookOpenIcon className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 truncate">{subj.subject}</p>
                                            <p className="text-xs text-slate-500 truncate">{subj.teacher ? `Teacher: ${subj.teacher.name}` : 'Teacher: Not assigned'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Section Incharge</h2>
                    {loadingInfo ? (
                        <p className="text-slate-500">Loading information...</p>
                    ) : inchargeInfo ? (
                        <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                            <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-slate-100">
                                <img src={inchargeInfo.photoURL} alt={inchargeInfo.name} className="w-8 h-8 rounded-full" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">{inchargeInfo.name}</p>
                                <p className="text-xs text-slate-500">{inchargeInfo.email}</p>
                            </div>
                        </div>
                    ) : (
                            <p className="text-slate-500">No incharge assigned to your section yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

