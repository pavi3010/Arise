import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SwitchRole from '../components/SwitchRole';
import {
  addSchoolGrade,
  addGradeSection,
  addSectionSubject,
  getSchoolGrades,
  getGradeSections,
  getSchoolUsers,
  setSectionIncharge,
  addSchoolUser
} from '../services/school.service';

// --- Helper Icon Components ---
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v6m-6-3h12" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>;

const Card = ({ title, icon, children, className }) => (
    <div className={`bg-white/60 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6 ${className}`}>
        <div className="flex items-center mb-4 text-xl font-bold text-slate-700">
            <div className="mr-3 text-indigo-500">{icon}</div>
            <h2>{title}</h2>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

function SchoolDashboard() {
    const [newUser, setNewUser] = useState({ email: '', displayName: '', role: 'staff' });
    const [userAddLoading, setUserAddLoading] = useState(false);
    const navigate = useNavigate();
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState({});
    const [users, setUsers] = useState([]);
    const [newGrade, setNewGrade] = useState('');
    const [newSection, setNewSection] = useState({});
    const [subjectInputs, setSubjectInputs] = useState({});
    const [inchargeInputs, setInchargeInputs] = useState({});
    const [loading, setLoading] = useState(false);
    const ariseUser = JSON.parse(localStorage.getItem('ariseUser') || '{"schoolId": null, "displayName":"Admin"}');
    const schoolId = ariseUser.schoolId;

    async function refreshData() {
        if (!schoolId) return;
        setLoading(true);
        const gradesList = await getSchoolGrades(schoolId);
        setGrades(gradesList);
        const allSections = {};
        for (const grade of gradesList) {
            allSections[grade.id] = await getGradeSections(schoolId, grade.id);
        }
        setSections(allSections);
        const userList = await getSchoolUsers(schoolId);
        setUsers(userList);
        setLoading(false);
    }
    
    useEffect(() => {
        refreshData();
    }, [schoolId]);

    function handleLogout() {
        localStorage.removeItem('ariseUser');
        navigate('/login');
    }

    async function handleAddUser(e) {
        e.preventDefault();
        if (!newUser.email || !newUser.role) return;
        setUserAddLoading(true);
        const userId = newUser.email.replace(/[^a-zA-Z0-9]/g, '_');
        await addSchoolUser(schoolId, userId, newUser);
        setNewUser({ email: '', displayName: '', role: 'staff' });
        await refreshData();
        setUserAddLoading(false);
    }

    async function handleAddGrade(e) {
        e.preventDefault();
        if (!newGrade.trim()) return;
        setLoading(true);
        await addSchoolGrade(schoolId, { name: newGrade });
        setNewGrade('');
        await refreshData();
        setLoading(false);
    }

    async function handleAddSection(gradeId) {
        const sectionName = newSection[gradeId];
        if (!sectionName || !sectionName.trim()) return;
        setLoading(true);
        await addGradeSection(schoolId, gradeId, { name: sectionName });
        setNewSection(ns => ({ ...ns, [gradeId]: '' }));
        await refreshData();
        setLoading(false);
    }

    async function handleAddSubject(gradeId, sectionId) {
        const { subject, teacherEmail } = subjectInputs[sectionId] || {};
        if (!subject || !teacherEmail) return;
        setLoading(true);
        await addSectionSubject(schoolId, gradeId, sectionId, { name: subject, teacherEmail });
        setSubjectInputs(inputs => ({ ...inputs, [sectionId]: { subject: '', teacherEmail: '' } }));
        await refreshData();
        setLoading(false);
    }

    async function handleSetIncharge(gradeId, sectionId) {
        const userId = inchargeInputs[sectionId];
        if (!userId) return;
        setLoading(true);
        await setSectionIncharge(schoolId, gradeId, sectionId, userId);
        setInchargeInputs(inputs => ({ ...inputs, [sectionId]: '' }));
        await refreshData();
        setLoading(false);
    }
    
    const staffUsers = users.filter(u => u.roles?.includes('staff') || u.roles?.includes('teacher') || u.role === 'staff' || u.role === 'teacher');
    
    return (
        <div className="relative min-h-screen w-full bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

            <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">School Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {ariseUser.displayName}!</p>
                </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <h1 className="text-2xl font-bold">School Dashboard</h1>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end items-center">
                                                    <div style={{ position: 'relative', zIndex: 50 }}>
                                                        <SwitchRole />
                                                    </div>
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                                <LogoutIcon />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
            </header>

            <main className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <Card title="Manage Users" icon={<UserGroupIcon />}>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <input type="text" placeholder="Full Name" value={newUser.displayName} onChange={e => setNewUser(u => ({ ...u, displayName: e.target.value }))} className="w-full bg-white/70 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition" required disabled={userAddLoading} />
                            <input type="email" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} className="w-full bg-white/70 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition" required disabled={userAddLoading} />
                            <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))} className="w-full bg-white/70 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition" required disabled={userAddLoading}>
                                <option value="staff">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button type="submit" className="w-full flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition" disabled={userAddLoading}>
                                <PlusIcon /> {userAddLoading ? 'Adding...' : 'Add User'}
                            </button>
                        </form>
                        <div className="border-t border-slate-200/80 my-4"></div>
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">Existing Users</h3>
                        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                             {users.length > 0 ? users.map(u => (
                                <li key={u.id} className="flex items-center gap-3">
                                    <UserCircleIcon />
                                    <div>
                                        <p className="font-semibold text-slate-700">{u.displayName || u.email}</p>
                                        <p className="text-sm text-slate-500">{u.email} - <span className="font-medium capitalize">{ (u.roles || [u.role]).join(', ') }</span></p>
                                    </div>
                                </li>
                            )) : <p className="text-sm text-slate-500 text-center">No users found.</p>}
                        </ul>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card title="Academic Management" icon={<AcademicCapIcon />}>
                        <form onSubmit={handleAddGrade} className="flex items-center gap-2">
                            <input type="text" value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder="New Grade Name (e.g., 6, 7, 8)" className="flex-grow bg-white/70 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition" disabled={loading} />
                            <button type="submit" className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition" disabled={loading}><PlusIcon/> Grade</button>
                        </form>
                        
                        <div className="mt-6 space-y-6">
                            {grades.length === 0 && <p className="text-center text-slate-500 py-4">No grades added yet. Start by adding a grade above.</p>}
                            {grades.map(grade => (
                                <div key={grade.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
                                    <h3 className="text-lg font-bold text-slate-700 mb-3">Grade {grade.name}</h3>
                                    {(sections[grade.id] || []).map(section => (
                                        <div key={section.id} className="ml-4 pl-4 border-l-2 border-slate-200 pb-4 mb-4 last:pb-0 last:mb-0 last:border-l-0">
                                             <h4 className="font-semibold text-slate-600">Section {section.name}</h4>
                                             <p className="text-sm text-slate-500 mb-2">In-charge: <span className="font-medium text-slate-600">{users.find(u => u.id === section.incharge)?.displayName || 'Not Assigned'}</span></p>
                                            
                                            <div className="flex gap-2 items-center mb-3">
                                                <select value={inchargeInputs[section.id] || ''} onChange={e => setInchargeInputs(inputs => ({ ...inputs, [section.id]: e.target.value }))} className="flex-grow text-sm bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none transition" disabled={loading}>
                                                    <option value="">Assign In-charge...</option>
                                                    {staffUsers.map(u => <option key={u.id} value={u.id}>{u.displayName || u.email}</option>)}
                                                </select>
                                                <button onClick={() => handleSetIncharge(grade.id, section.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-500 rounded-md shadow-sm hover:bg-purple-600 disabled:bg-purple-300 transition" disabled={loading || !inchargeInputs[section.id]}>Set</button>
                                            </div>
                                             
                                            <div className="text-sm">
                                                <h5 className="font-semibold text-slate-600 mb-1">Subjects</h5>
                                                <ul className="space-y-1 mb-2">
                                                    {(section.subjects || []).map((subj, idx) => (
                                                        <li key={idx} className="text-slate-500 text-xs pl-2">{subj.name} - <span className="italic">{subj.teacherEmail}</span></li>
                                                    ))}
                                                    {(section.subjects || []).length === 0 && <li className="text-slate-400 text-xs pl-2">No subjects added.</li>}
                                                </ul>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                     <input type="text" placeholder="Subject Name" value={subjectInputs[section.id]?.subject || ''} onChange={e => setSubjectInputs(inputs => ({ ...inputs, [section.id]: { ...inputs[section.id], subject: e.target.value } }))} className="flex-grow text-sm bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none transition" disabled={loading} />
                                                     <select value={subjectInputs[section.id]?.teacherEmail || ''} onChange={e => setSubjectInputs(inputs => ({ ...inputs, [section.id]: { ...inputs[section.id], teacherEmail: e.target.value } }))} className="flex-grow text-sm bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none transition" disabled={loading}>
                                                         <option value="">Assign Teacher...</option>
                                                         {staffUsers.map(u => <option key={u.id} value={u.email}>{u.displayName || u.email}</option>)}
                                                     </select>
                                                     <button onClick={() => handleAddSubject(grade.id, section.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600 disabled:bg-green-300 transition" disabled={loading}>Add Subject</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-2 mt-4 ml-4 pl-4 border-l-2 border-transparent">
                                         <input type="text" placeholder="New Section Name" value={newSection[grade.id] || ''} onChange={e => setNewSection(ns => ({ ...ns, [grade.id]: e.target.value }))} className="flex-grow text-sm bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none transition" disabled={loading} />
                                         <button onClick={() => handleAddSection(grade.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-500 rounded-md shadow-sm hover:bg-sky-600 disabled:bg-sky-300 transition" disabled={loading}>Add Section</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default SchoolDashboard;

