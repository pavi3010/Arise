
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
    const isApproved = userProfile?.approved !== false;

    async function handleLogout() {
        try {
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    // Fetch grades, sections, and users on mount, but only if approved
    useEffect(() => {
        if (!schoolId || !isApproved) return;
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
    }, [schoolId, isApproved]);


    // Find all sections where current user is incharge or a subject faculty
    // Build a list of all sections where the staff is incharge, subject teacher, or both
    const mySections = [];
    if (isApproved) {
        grades.forEach(grade => {
            (sections[grade.id] || []).forEach(section => {
                let isIncharge = String(section.incharge) === String(userId);
                let isSubjectFaculty = Array.isArray(section.subjects) && section.subjects.some(subj => String(subj.teacherId) === String(userId) || subj.teacherEmail === userProfile?.email);
                if (isIncharge || isSubjectFaculty) {
                    mySections.push({ grade, section, isIncharge, isSubjectFaculty });
                }
            });
        });
    }

    // Section/role selection state
    const [selectedSectionId, setSelectedSectionId] = React.useState(null);
    const [selectedRole, setSelectedRole] = React.useState(null); // 'incharge' | 'subject' | null

    // When mySections changes, reset selection
    React.useEffect(() => {
        if (mySections.length > 0) {
            setSelectedSectionId(mySections[0].section.id);
            // Prefer incharge if both, else whichever is available
            setSelectedRole(mySections[0].isIncharge ? 'incharge' : 'subject');
        } else {
            setSelectedSectionId(null);
            setSelectedRole(null);
        }
    }, [mySections.length]);

    // Pending students for teacher's sections (approval by incharge only)
    useEffect(() => {
        if (!isApproved || !users.length || !mySections.length) return;
        // Only incharge can see/approve invites
        const inchargeOnlySections = mySections.filter(s => s.isIncharge);
        // Helper to fetch roles subcollection for a user
        async function fetchPendingStudents() {
            const pending = [];
            for (const u of users) {
                // Only check users who might be students
                if (!(u.roles?.includes('student') || u.role === 'student' || u.userType === 'student')) continue;
                // If root doc is already approved, skip
                if (u.approved === true) continue;
                // Check roles subcollection for student role
                let roleGradeId = u.gradeId;
                let roleApproved = u.approved;
                try {
                    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
                    const db = getFirestore();
                    const roleRef = doc(db, 'schools', schoolId, 'users', u.id, 'roles', 'student');
                    const roleSnap = await getDoc(roleRef);
                    if (roleSnap.exists()) {
                        const roleData = roleSnap.data();
                        if (roleData.gradeId) roleGradeId = roleData.gradeId;
                        if (typeof roleData.approved !== 'undefined') roleApproved = roleData.approved;
                    }
                } catch (err) {
                    // Ignore Firestore errors, fallback to root doc
                }
                // Only show if not approved and gradeId matches a grade where user is incharge
                if (roleApproved === false || typeof roleApproved === 'undefined') {
                    if (inchargeOnlySections.some(({ grade }) => grade.id === roleGradeId)) {
                        pending.push({ ...u, gradeId: roleGradeId, approved: roleApproved });
                    }
                }
            }
            setPendingStudents(pending);
        }
        fetchPendingStudents();
    }, [isApproved, users, mySections, schoolId]);


    // Assign a pending student to a section and approve them
    async function handleAssignStudentToSection(student, section) {
        setLoading(true);
        try {
            // Add student ID to section's students array
            const addResult = await addSectionStudent(schoolId, section.gradeId, section.id, student.id);
            // Update student's sectionId, gradeId, and approved in Firestore directly
            const { db } = await import('../firebase');
            const { doc, updateDoc, setDoc, getDoc } = await import('firebase/firestore');
            const studentRef = doc(db, 'schools', schoolId, 'users', student.id);
            await updateDoc(studentRef, { sectionId: section.id, gradeId: section.gradeId, approved: true });
            // Also update the roles subcollection for student approval
            const roleRef = doc(db, 'schools', schoolId, 'users', student.id, 'roles', 'student');
            const roleSnap = await getDoc(roleRef);
            if (roleSnap.exists()) {
                await updateDoc(roleRef, { approved: true, sectionId: section.id, gradeId: section.gradeId });
            } else {
                await setDoc(roleRef, { approved: true, sectionId: section.id, gradeId: section.gradeId }, { merge: true });
            }
            // Refresh users and sections
            await Promise.all([
                getSchoolUsers(schoolId).then(u => { 
                    setUsers(u); 
                }),
                getSchoolGrades(schoolId).then(async gradesList => {
                    setGrades(gradesList);
                    const allSections = {};
                    for (const grade of gradesList) {
                        allSections[grade.id] = await getGradeSections(schoolId, grade.id);
                    }
                    setSections(allSections);
                })
            ]);
        } catch (error) {
            console.error('Failed to assign student to section:', error);
            alert('Failed to assign student to section: ' + (error?.message || error));
        } finally {
            setLoading(false);
        }
    }



    if (!isApproved) {
        return (
            <div className="relative min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
                <div className="relative z-10 max-w-lg w-full bg-white/80 rounded-3xl shadow-xl border border-white/20 p-8 flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Staff Dashboard</h1>
                    <p className="text-slate-500 mb-6">Welcome, {userProfile?.displayName || ''}!</p>
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-amber-700 bg-amber-100 px-4 py-2 rounded-full font-medium text-lg">Your account is pending approval by the school admin.</span>
                        <span className="text-slate-500 text-center">You will be able to access your dashboard once approved.</span>
                        <SwitchRole />
                        <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium text-white bg-slate-400 rounded-lg shadow-sm hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">Back</button>
                    </div>
                </div>
            </div>
        );
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
                    <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium text-white bg-slate-400 rounded-lg shadow-sm hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">Back</button>
                </div>
            </header>

            {/* My Sections & Role Switcher */}
            <Card title="Your Section Roles" icon={<ClipboardListIcon />}>
                {mySections.length === 0 ? (
                    <div className="text-center py-4 text-slate-500">You are not assigned to any sections.</div>
                ) : (
                    <div className="space-y-4">
                        {mySections.map(({ grade, section, isIncharge, isSubjectFaculty }) => {
                            const roles = [];
                            if (isIncharge) roles.push('Incharge');
                            if (isSubjectFaculty) roles.push('Subject Teacher');
                            const isSelected = selectedSectionId === section.id;
                            return (
                                <div key={section.id} className={`rounded-xl p-4 border ${isSelected ? 'border-indigo-400 bg-indigo-50/40' : 'border-slate-200 bg-slate-100/70'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                                    <div>
                                        <div className="font-semibold text-slate-800">Grade {grade.name} - Section {section.name}</div>
                                        <div className="text-xs text-slate-500">Roles: {roles.join(', ')}</div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {isIncharge && (
                                            <button
                                                className={`px-3 py-1 rounded-lg text-sm font-medium border ${isSelected && selectedRole === 'incharge' ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-600 border-indigo-300'}`}
                                                onClick={() => { setSelectedSectionId(section.id); setSelectedRole('incharge'); }}
                                            >
                                                Incharge
                                            </button>
                                        )}
                                        {isSubjectFaculty && (
                                            <button
                                                className={`px-3 py-1 rounded-lg text-sm font-medium border ${isSelected && selectedRole === 'subject' ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 border-emerald-300'}`}
                                                onClick={() => { setSelectedSectionId(section.id); setSelectedRole('subject'); }}
                                            >
                                                Subject Teacher
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Contextual Features Panel */}
            {selectedSectionId && selectedRole && (
                <div className="mt-8">
                    {selectedRole === 'incharge' ? (
                        <Card title="Incharge Features" icon={<ClipboardListIcon />}>
                            {/* Pending Student Requests for this section's grade only */}
                            <div className="mb-4 font-semibold text-slate-700">Pending Student Requests (Grade {mySections.find(s => s.section.id === selectedSectionId)?.grade.name})</div>
                            {pendingStudents.filter(s => s.gradeId === mySections.find(sec => sec.section.id === selectedSectionId)?.grade.id).length === 0 ? (
                                <div className="text-center py-2 text-slate-500">No pending student requests for this grade.</div>
                            ) : (
                                <div className="space-y-2">
                                    {pendingStudents.filter(s => s.gradeId === mySections.find(sec => sec.section.id === selectedSectionId)?.grade.id).map(student => (
                                        <div key={student.id} className="bg-slate-100/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200">
                                            <div>
                                                <div className="font-semibold text-slate-800">{student.displayName} <span className="text-xs text-slate-500">({student.email})</span></div>
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
                            {/* Section Student List */}
                            <div className="mt-6 font-semibold text-slate-700">Students in Section</div>
                            <SectionStudentList 
                                schoolId={schoolId} 
                                gradeId={mySections.find(s => s.section.id === selectedSectionId)?.grade.id} 
                                section={mySections.find(s => s.section.id === selectedSectionId)?.section} 
                                canManage={true} 
                            />
                        </Card>
                    ) : (
                        <Card title="Subject Teacher Features" icon={<ClipboardListIcon />}>
                            <div className="mb-4 font-semibold text-slate-700">Subjects you teach in this section:</div>
                            <ul className="list-disc ml-6">
                                {mySections.find(s => s.section.id === selectedSectionId)?.section.subjects?.filter(subj => String(subj.teacherId) === String(userId) || subj.teacherEmail === userProfile?.email).map((subj, idx) => (
                                    <li key={idx} className="mb-1">
                                        <span className="font-medium">{subj.name || subj.subjectName || 'Subject'}</span>
                                    </li>
                                ))}
                            </ul>
                            {/* Student List (read-only) */}
                            <div className="mt-6 font-semibold text-slate-700">Students in Section</div>
                            <SectionStudentList 
                                schoolId={schoolId} 
                                gradeId={mySections.find(s => s.section.id === selectedSectionId)?.grade.id} 
                                section={mySections.find(s => s.section.id === selectedSectionId)?.section} 
                                canManage={false} 
                            />
                        </Card>
                    )}
                </div>
            )}
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

