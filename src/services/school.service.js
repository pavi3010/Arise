// Add a student to a section (by incharge faculty)
export async function addSectionStudent(schoolId, gradeId, sectionId, studentData) {
  // studentData should include at least: { id, displayName, email, ... }
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  const sectionSnap = await getDoc(sectionRef);
  if (!sectionSnap.exists()) throw new Error('Section not found');
  const sectionObj = sectionSnap.data();
  const students = sectionObj.students || [];
  students.push(studentData);
  await updateDoc(sectionRef, { students });
}

// Get all students in a section
export async function getSectionStudents(schoolId, gradeId, sectionId) {
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  const sectionSnap = await getDoc(sectionRef);
  if (!sectionSnap.exists()) return [];
  return sectionSnap.data().students || [];
}
// Assign an incharge faculty (teacher) to a section
export async function setSectionIncharge(schoolId, gradeId, sectionId, inchargeUserId) {
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  await updateDoc(sectionRef, { incharge: inchargeUserId });
}

// Get incharge faculty info for a section (returns userId)
export async function getSectionIncharge(schoolId, gradeId, sectionId) {
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  const sectionSnap = await getDoc(sectionRef);
  if (!sectionSnap.exists()) return null;
  return sectionSnap.data().incharge || null;
}
import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';

// Create a new school
export async function createSchool(schoolData) {
  const schoolRef = await addDoc(collection(db, 'schools'), schoolData);
  return schoolRef.id;
}

// Add a user (admin/teacher) to a school's users subcollection
export async function addSchoolUser(schoolId, userId, userData) {
  const userRef = doc(db, 'schools', schoolId, 'users', userId);
  await setDoc(userRef, userData);
}

// Add a grade (class) to a school's classes subcollection
export async function addSchoolGrade(schoolId, gradeData) {
  const gradeRef = await addDoc(collection(db, 'schools', schoolId, 'grades'), gradeData);
  return gradeRef.id;
}

// Add a section to a grade
export async function addGradeSection(schoolId, gradeId, sectionData) {
  const sectionRef = await addDoc(collection(db, 'schools', schoolId, 'grades', gradeId, 'sections'), sectionData);
  return sectionRef.id;
}

// Add a subject to a section (with teacher mapping)
export async function addSectionSubject(schoolId, gradeId, sectionId, subjectData) {
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  const sectionSnap = await getDoc(sectionRef);
  if (!sectionSnap.exists()) throw new Error('Section not found');
  const sectionObj = sectionSnap.data();
  const subjects = sectionObj.subjects || [];
  subjects.push(subjectData);
  await updateDoc(sectionRef, { subjects });
}

// Get all schools
export async function getAllSchools() {
  const schoolsSnap = await getDocs(collection(db, 'schools'));
  return schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all grades for a school
export async function getSchoolGrades(schoolId) {
  const gradesSnap = await getDocs(collection(db, 'schools', schoolId, 'grades'));
  return gradesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all sections for a grade
export async function getGradeSections(schoolId, gradeId) {
  const sectionsSnap = await getDocs(collection(db, 'schools', schoolId, 'grades', gradeId, 'sections'));
  return sectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all users for a school
export async function getSchoolUsers(schoolId) {
  const usersSnap = await getDocs(collection(db, 'schools', schoolId, 'users'));
  return usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
