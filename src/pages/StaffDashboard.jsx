
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SwitchRole from '../components/SwitchRole';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { logOut } from '../firebase';
import { getSchoolGrades, getGradeSections, addSectionStudent, getSchoolUsers, getSectionStudents } from '../services/school.service';

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
    const [pendingStudents, setPendingStudents] = useState([]);
    const [users, setUsers] = useState([]);
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
    // Fetch grades, sections, and users on mount
    useEffect(() => {
        if (!schoolId) return;
        setLoading(true);
        Promise.all([
            getSchoolGrades(schoolId).then(async gradesList => {
                setGrades(gradesList);
                const allSections = {};
                for (const grade of gradesList) {
                    allSections[grade.id] = await getGradeSections(schoolId, grade.id);
                }
                setSections(allSections);
            }),
            getSchoolUsers(schoolId).then(setUsers)
        ]).finally(() => setLoading(false));
    }, [schoolId]);


    // Find all sections where current user is incharge or a subject faculty
    const inchargeSections = [];
    const inchargeSectionIdsSet = new Set();
    grades.forEach(grade => {
        (sections[grade.id] || []).forEach(section => {
            // Incharge: compare as string for safety
            let isIncharge = String(section.incharge) === String(userId);
            // Subject faculty
            let isSubjectFaculty = Array.isArray(section.subjects) && section.subjects.some(subj => String(subj.teacherId) === String(userId) || subj.teacherEmail === userProfile?.email);
            if (isIncharge || isSubjectFaculty) {
                inchargeSections.push({ grade, section, isIncharge, isSubjectFaculty });
                inchargeSectionIdsSet.add(section.id);
            }
        });
    });
    const inchargeSectionIds = Array.from(inchargeSectionIdsSet);

    // Pending students for teacher's sections (not yet assigned to a section, but only for sections the user is incharge of)
    useEffect(() => {
        if (!users.length || !inchargeSections.length) return;
        // Only incharge can see/approve invites
        const inchargeOnlySections = inchargeSections.filter(s => s.isIncharge);
        const pending = users.filter(u => {
            if (!(u.roles?.includes('student') || u.role === 'student')) return false;
            if (u.approved === false) return false;
            // Only show if their gradeId matches a grade where user is incharge and only if not already assigned
            return (!u.sectionId || u.sectionId === '') && inchargeOnlySections.some(({ grade }) => grade.id === u.gradeId);
        });
        setPendingStudents(pending);
    }, [users, inchargeSections]);


    // Assign a pending student to a section
    async function handleAssignStudentToSection(student, section) {
        setLoading(true);
        try {
            console.log('[DEBUG] Assigning student to section', {
                schoolId,
                student,
                section,
                sectionGradeId: section.gradeId,
                sectionId: section.id
            });
            // Add student ID to section's students array
            const addResult = await addSectionStudent(schoolId, section.gradeId, section.id, student.id);
            console.log('[DEBUG] addSectionStudent result:', addResult);
            // Update student's sectionId and gradeId in Firestore directly
            const { db } = await import('../firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            const studentRef = doc(db, 'schools', schoolId, 'users', student.id);
            await updateDoc(studentRef, { sectionId: section.id, gradeId: section.gradeId });
            console.log('[DEBUG] Updated student document in Firestore with sectionId and gradeId.');
            // Refresh users and sections
            await Promise.all([
                getSchoolUsers(schoolId).then(u => { console.log('[DEBUG] Refreshed users:', u); setUsers(u); }),
                getSchoolGrades(schoolId).then(async gradesList => {
                    setGrades(gradesList);
                    const allSections = {};
                    for (const grade of gradesList) {
                        allSections[grade.id] = await getGradeSections(schoolId, grade.id);
                    }
                    console.log('[DEBUG] Refreshed sections:', allSections);
                    setSections(allSections);
                })
            ]);
            console.log('[DEBUG] Student assignment to section complete.');
        } catch (error) {
            console.error('Failed to assign student to section:', error);
            alert('Failed to assign student to section: ' + (error?.message || error));
        } finally {
            setLoading(false);
        }
    }



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

            <main className="relative z-10 space-y-8">
                {/* Pending Student Requests */}
                <Card title="Pending Student Requests" icon={<ClipboardListIcon />}>
                    {pendingStudents.length === 0 ? (
                        <div className="text-center py-4 text-slate-500">No pending student requests for your grades.</div>
                    ) : (
                        <div className="space-y-4">
                            {pendingStudents.map(student => (
                                <div key={student.id} className="bg-slate-100/70 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200">
                                    <div>
                                        <div className="font-semibold text-slate-800">{student.displayName} <span className="text-xs text-slate-500">({student.email})</span></div>
                                        <div className="text-sm text-slate-500">Grade: {grades.find(g => g.id === student.gradeId)?.name || student.gradeId}</div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                                        <span className="text-xs text-slate-500">Assign to section:</span>
                                        <select
                                            className="bg-white border border-slate-300 rounded-lg px-2 py-1"
                                            onChange={e => {
                                                const sec = (sections[student.gradeId] || []).find(sec => sec.id === e.target.value);
                                                if (sec) {
                                                    handleAssignStudentToSection(student, { ...sec, gradeId: student.gradeId });
                                                }
                                            }}
                                            defaultValue=""
                                            disabled={loading}
                                        >
                                            <option value="" disabled>Select section</option>
                                            {(sections[student.gradeId] || []).map(sec => (
                                                <option key={sec.id} value={sec.id}>{sec.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Your Sections */}
                <Card title="Your Sections" icon={<ClipboardListIcon />}>
                    {loading ? (
                        <p className="text-center text-slate-500">Loading your sections...</p>
                    ) : inchargeSections.length > 0 ? (
                        <div className="space-y-6">
                            {inchargeSections.map(({ grade, section, isIncharge, isSubjectFaculty }) => (
                                <div key={section.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
                                    <h3 className="text-lg font-bold text-slate-700">
                                        Grade {grade.name} - Section {section.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">Students in this section:</p>
                                    <SectionStudentList 
                                        schoolId={schoolId} 
                                        gradeId={grade.id} 
                                        section={section} 
                                        canManage={isIncharge} 
                                    />
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

// SectionStudentList: shows students in a section and allows moving them to another section in the same grade
function SectionStudentList({ schoolId, gradeId, section, canManage }) {
    const [studentDetails, setStudentDetails] = React.useState([]);
    const [moveTarget, setMoveTarget] = React.useState({});
    const [otherSections, setOtherSections] = React.useState([]);

    React.useEffect(() => {
        // Fetch student IDs in this section
        getSectionStudents(schoolId, gradeId, section.id).then(async (studentIds) => {
            if (!studentIds.length) {
                setStudentDetails([]);
                return;
            }
            // Fetch user details for each student ID
            const usersSnap = await import('../services/school.service');
            const { getSchoolUsers } = usersSnap;
            const allUsers = await getSchoolUsers(schoolId);
            // Filter only those in this section
            const details = allUsers.filter(u => studentIds.includes(u.id));
            setStudentDetails(details);
        });
        getGradeSections(schoolId, gradeId).then(secs => {
            setOtherSections(secs.filter(sec => sec.id !== section.id));
        });
    }, [schoolId, gradeId, section.id]);

    // Only incharge can move students
    async function handleMoveStudent(student, targetSectionId) {
        if (!canManage || !targetSectionId) return;
        await addSectionStudent(schoolId, gradeId, targetSectionId, student.id);
        // Refresh this section's students after move
        getSectionStudents(schoolId, gradeId, section.id).then(async (studentIds) => {
            const usersSnap = await import('../services/school.service');
            const { getSchoolUsers } = usersSnap;
            const allUsers = await getSchoolUsers(schoolId);
            const details = allUsers.filter(u => studentIds.includes(u.id));
            setStudentDetails(details);
        });
    }

    if (!studentDetails.length) return <div className="text-slate-400 text-sm">No students in this section.</div>;
    return (
        <ul className="divide-y divide-slate-200">
            {studentDetails.map(student => (
                <li key={student.id} className="flex items-center justify-between py-2">
                    <span
                        className="cursor-pointer hover:underline"
                        onClick={() => alert(`Name: ${student.name || student.displayName || 'N/A'}\nEmail: ${student.email || 'N/A'}\nID: ${student.id}`)}
                    >
                        {student.name || student.displayName || 'Unknown'} <span className="text-xs text-slate-500">({student.email || student.id})</span>
                    </span>
                    {canManage ? (
                        <select
                            className="ml-2 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                            value={moveTarget[student.id] || ''}
                            onChange={e => { setMoveTarget(mt => ({ ...mt, [student.id]: e.target.value })); handleMoveStudent(student, e.target.value); }}
                        >
                            <option value="">Move to section...</option>
                            {otherSections.map(sec => (
                                <option key={sec.id} value={sec.id}>{sec.name}</option>
                            ))}
                        </select>
                    ) : null}
                </li>
            ))}
        </ul>
    );
}

