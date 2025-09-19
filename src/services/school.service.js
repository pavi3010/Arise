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

// Add a class to a school's classes subcollection
export async function addSchoolClass(schoolId, classData) {
  const classRef = await addDoc(collection(db, 'schools', schoolId, 'classes'), classData);
  return classRef.id;
}

// Add a subject to a class (with teacher mapping)
export async function addClassSubject(schoolId, classId, subjectData) {
  const classRef = doc(db, 'schools', schoolId, 'classes', classId);
  const classSnap = await getDoc(classRef);
  if (!classSnap.exists()) throw new Error('Class not found');
  const classObj = classSnap.data();
  const subjects = classObj.subjects || [];
  subjects.push(subjectData);
  await updateDoc(classRef, { subjects });
}

// Get all schools
export async function getAllSchools() {
  const schoolsSnap = await getDocs(collection(db, 'schools'));
  return schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all classes for a school
export async function getSchoolClasses(schoolId) {
  const classesSnap = await getDocs(collection(db, 'schools', schoolId, 'classes'));
  return classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all users for a school
export async function getSchoolUsers(schoolId) {
  const usersSnap = await getDocs(collection(db, 'schools', schoolId, 'users'));
  return usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
