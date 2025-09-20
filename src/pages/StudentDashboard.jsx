import React from 'react';
import { useNavigate } from 'react-router-dom';
import OfflineQuiz from './OfflineQuiz';
import SwitchRole from '../components/SwitchRole';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { logOut } from '../firebase';

// --- Helper Icon Components ---
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm5-6a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm5 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13 3a1 1 0 00-1.22-.995l-3.1 1.24a1 1 0 00-.56 1.485L9.58 6.5H5.53A2.5 2.5 0 003.07 9.07l1.19 3.33a2.5 2.5 0 002.39 1.76h4.7a2.5 2.5 0 002.39-1.76l1.19-3.33A2.5 2.5 0 0014.47 6.5h-4.05l1.46-1.77a1 1 0 00-.22-1.485l-3.1-1.24A1 1 0 008 3h5zM4.6 15a1 1 0 100 2h10.8a1 1 0 100-2H4.6z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const WifiOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
  </svg>
);

const ActionCard = ({ title, description, icon, color, onClick, disabled = false }) => (
  <div 
    className={`group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/30 p-6 flex items-center gap-6 transition-all duration-300 ${
      disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
    }`}
    onClick={disabled ? undefined : onClick}
  >
    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
    <div className={`absolute top-1/2 -translate-y-1/2 right-6 text-slate-300 transition-all duration-300 ${
      !disabled && 'group-hover:text-slate-500 group-hover:translate-x-1'
    }`}>
      <ChevronRightIcon />
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-slate-600">Loading...</span>
  </div>
);

const InfoCard = ({ title, children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 ${className}`}>
    <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
    {children}
  </div>
);

export default function StudentDashboard() {
  console.log('[StudentDashboard] Component rendered');
  
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isOnline = useOnlineStatus();
  
  const [sectionInfo, setSectionInfo] = React.useState(null);
  const [inchargeInfo, setInchargeInfo] = React.useState(null);
  const [subjectTeachers, setSubjectTeachers] = React.useState([]);
  const [gradeName, setGradeName] = React.useState('');
  const [loadingInfo, setLoadingInfo] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchSectionDetails() {
      console.log('[StudentDashboard] userProfile at start:', userProfile);
      
      if (!userProfile?.schoolId || !userProfile?.gradeId || !userProfile?.sectionId) {
        console.log('[StudentDashboard] Missing required userProfile fields:', {
          schoolId: userProfile?.schoolId,
          gradeId: userProfile?.gradeId,
          sectionId: userProfile?.sectionId
        });
        setLoadingInfo(false);
        return;
      }

      setLoadingInfo(true);
      setError(null);

      try {
        const { getGradeSections, getSchoolUsers, getSchoolGrades } = await import('../services/school.service');
        
        // Get section info
        const sections = await getGradeSections(userProfile.schoolId, userProfile.gradeId);
        const section = sections.find(sec => sec.id === userProfile.sectionId);
        console.log('[StudentDashboard] Section:', section);
        setSectionInfo(section);

        // Get all users for lookup
        const users = await getSchoolUsers(userProfile.schoolId);
        console.log('[StudentDashboard] Users:', users);

        // Incharge info
        let incharge = null;
        if (section?.incharge) {
          incharge = users.find(u => u.id === section.incharge);
        }
        console.log('[StudentDashboard] Incharge:', incharge);
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
        console.log('[StudentDashboard] SubjectTeachers:', teachers);
        setSubjectTeachers(teachers);

        // Get grade name
        const grades = await getSchoolGrades(userProfile.schoolId);
        const grade = grades.find(g => g.id === userProfile.gradeId);
        setGradeName(grade ? grade.name : userProfile.gradeId);
      } catch (err) {
        console.error('[StudentDashboard] Error fetching section details:', err);
        setError('Failed to load section information. Please try again later.');
      } finally {
        setLoadingInfo(false);
      }
    }

    fetchSectionDetails();
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleActionClick = (action) => {
    switch (action) {
      case 'continue':
        navigate('/quiz/continue');
        break;
      case 'offline-quizzes':
        navigate('/offline-quizzes');
        break;
      case 'progress':
        navigate('/progress');
        break;
      case 'achievements':
        navigate('/achievements');
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-[#e8f2ff] to-[#dae9ff]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                Welcome back, {userProfile?.firstName || 'Student'}!
              </h1>
              {!isOnline && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  <WifiOffIcon />
                  Offline
                </div>
              )}
            </div>
            {gradeName && (
              <p className="text-lg text-slate-600">
                Grade: <span className="font-semibold text-slate-800">{gradeName}</span>
                {sectionInfo?.name && (
                  <span className="ml-2">Section: <span className="font-semibold text-slate-800">{sectionInfo.name}</span></span>
                )}
              </p>
            )}
          </div>
          
          <div className="mt-6 sm:mt-0 flex items-center gap-3">
            <SwitchRole />
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-red-500 text-white shadow-lg hover:bg-red-600 hover:shadow-xl transition-all duration-300"
            >
              <LogoutIcon />
              <span className="ml-2">Logout</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-800 rounded-xl">
            {error}
          </div>
        )}

        {/* Offline Quiz Section */}
        <div className="mb-12">
          <OfflineQuiz />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <ActionCard
            title="Continue Learning"
            description="Pick up where you left off in your quizzes and lessons."
            icon={<PlayIcon />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            onClick={() => handleActionClick('continue')}
          />
          <ActionCard
            title="Offline Quizzes"
            description="Access and manage your downloaded quizzes."
            icon={<BookOpenIcon />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => handleActionClick('offline-quizzes')}
          />
          <ActionCard
            title="Your Progress"
            description="Monitor your learning progress and achievements."
            icon={<ChartBarIcon />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            onClick={() => handleActionClick('progress')}
          />
          <ActionCard
            title="Achievements"
            description="View your earned badges and certificates."
            icon={<TrophyIcon />}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            onClick={() => handleActionClick('achievements')}
          />
        </div>

        {/* Information Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Subjects and Teachers */}
          <InfoCard title="Your Subjects and Teachers">
            {loadingInfo ? (
              <LoadingSpinner />
            ) : subjectTeachers.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No subjects found for your section.</p>
            ) : (
              <div className="space-y-4">
                {subjectTeachers.map((subj, idx) => (
                  <div key={idx} className="bg-white/60 rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <BookOpenIcon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{subj.subject}</p>
                      <p className="text-sm text-slate-600 truncate">
                        {subj.teacher ? `${subj.teacher.name}` : 'Teacher not assigned'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>

          {/* Section Incharge */}
          <InfoCard title="Section Incharge">
            {loadingInfo ? (
              <LoadingSpinner />
            ) : inchargeInfo ? (
              <div className="bg-white/60 rounded-xl shadow-sm p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {inchargeInfo.photoURL ? (
                    <img 
                      src={inchargeInfo.photoURL} 
                      alt={inchargeInfo.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                  <div className="w-full h-full items-center justify-center hidden">
                    <UserIcon className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{inchargeInfo.name}</p>
                  <p className="text-sm text-slate-600">{inchargeInfo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No incharge assigned to your section yet.</p>
            )}
          </InfoCard>
        </div>
      </div>
    </div>
  );
}