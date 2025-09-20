// --- Import content from JSON file ---
export async function importContentFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Import quizzes
        if (Array.isArray(data.quizzes)) {
          for (const quiz of data.quizzes) {
            // Avoid duplicate by title+grade+subject (customize as needed)
            const exists = await db.quizzes.where({
              title: quiz.title,
              grade: quiz.grade,
              subject: quiz.subject
            }).first();
            if (!exists) await db.quizzes.add(quiz);
          }
        }
        // Import lessons
        if (Array.isArray(data.lessons)) {
          for (const lesson of data.lessons) {
            const exists = await db.lessons.where({
              title: lesson.title,
              grade: lesson.grade,
              subject: lesson.subject
            }).first();
            if (!exists) await db.lessons.add(lesson);
          }
        }
        // Import games
        if (Array.isArray(data.games)) {
          for (const game of data.games) {
            const exists = await db.games.where({
              title: game.title,
              grade: game.grade,
              subject: game.subject
            }).first();
            if (!exists) await db.games.add(game);
          }
        }
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
// --- Export all or selected content as JSON file ---
export async function exportContent({ quizzes = null, lessons = null, games = null } = {}) {
  // If arrays provided, use them; otherwise, fetch all from DB
  const [allQuizzes, allLessons, allGames] = await Promise.all([
    quizzes ? Promise.resolve(quizzes) : db.quizzes.toArray(),
    lessons ? Promise.resolve(lessons) : db.lessons.toArray(),
    games ? Promise.resolve(games) : db.games.toArray()
  ]);
  const exportObj = {
    quizzes: allQuizzes,
    lessons: allLessons,
    games: allGames,
    exportedAt: Date.now()
  };
  const json = JSON.stringify(exportObj, null, 2);
  // Create a blob and trigger download
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arise-content-export-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
// src/utils/db.js
// Dexie.js setup for offline lessons/games/quizzes storage
import Dexie from 'dexie';

// Define your database
const db = new Dexie('AriseOfflineContent');

db.version(1).stores({
  quizzes: '++id, title, subject, grade, updatedAt', // auto-increment id
  lessons: '++id, title, subject, grade, updatedAt',
  games: '++id, title, subject, grade, updatedAt'
});

// Example schema for a quiz
// {
//   id: 1,
//   title: 'Properties of Whole Numbers',
//   subject: 'Mathematics',
//   grade: 'grade6',
//   questions: [...],
//   updatedAt: 1695200000000
// }

// --- Helper functions for quizzes ---
export async function addQuiz(quiz) {
  return db.quizzes.add({ ...quiz, updatedAt: Date.now() });
}

export async function getQuiz(id) {
  return db.quizzes.get(id);
}

export async function getAllQuizzes() {
  return db.quizzes.toArray();
}

export async function getQuizzesBySubject(subject) {
  return db.quizzes.where('subject').equals(subject).toArray();
}

// --- Helper functions for lessons ---
export async function addLesson(lesson) {
  return db.lessons.add({ ...lesson, updatedAt: Date.now() });
}

export async function getLesson(id) {
  return db.lessons.get(id);
}

export async function getAllLessons() {
  return db.lessons.toArray();
}

// --- Helper functions for games ---
export async function addGame(game) {
  return db.games.add({ ...game, updatedAt: Date.now() });
}

export async function getGame(id) {
  return db.games.get(id);
}

export async function getAllGames() {
  return db.games.toArray();
}

export default db;