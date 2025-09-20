// src/utils/db.js
// Dexie.js setup for offline lessons/games/quizzes storage
import Dexie from 'dexie';

// Define your database (unchanged schema)
const db = new Dexie('AriseOfflineContent');

db.version(1).stores({
  quizzes: '++id, title, subject, grade, updatedAt',
  lessons: '++id, title, subject, grade, updatedAt',
  games:   '++id, title, subject, grade, updatedAt'
});

// ----------------------
// Helper: Dedup Key
// ----------------------
function makeKey(item) {
  return `${item.title}|${item.grade}|${item.subject}`;
}

// ----------------------
// Generic Import Helper
// ----------------------
async function importItems(table, items) {
  if (!Array.isArray(items)) return;

  // Fetch existing records once (faster than per-item queries)
  const existing = await db[table].toArray();
  const existingKeys = new Set(existing.map(makeKey));

  // Collect new items
  const newItems = [];
  for (const item of items) {
    if (!item.title || !item.grade || !item.subject) continue; // validate
    if (!existingKeys.has(makeKey(item))) {
      newItems.push({ ...item, updatedAt: Date.now() });
    }
  }

  // Bulk insert for performance
  if (newItems.length > 0) {
    await db[table].bulkAdd(newItems);
  }
}

// ----------------------
// Import content from JSON
// ----------------------
export async function importContentFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);

        await importItems('quizzes', data.quizzes);
        await importItems('lessons', data.lessons);
        await importItems('games', data.games);

        resolve(true);
      } catch (err) {
        reject(new Error(`Import failed: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// ----------------------
// Export content to JSON
// ----------------------
export async function exportContent({ quizzes = null, lessons = null, games = null } = {}) {
  // If arrays provided, use them; otherwise fetch all
  const [allQuizzes, allLessons, allGames] = await Promise.all([
    quizzes ? Promise.resolve(quizzes) : db.quizzes.toArray(),
    lessons ? Promise.resolve(lessons) : db.lessons.toArray(),
    games   ? Promise.resolve(games)   : db.games.toArray()
  ]);

  const exportObj = {
    quizzes: allQuizzes,
    lessons: allLessons,
    games: allGames,
    exportedAt: new Date().toISOString()
  };

  const json = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `arise-content-export-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);

  try {
    a.click();
  } finally {
    a.remove();
    URL.revokeObjectURL(url);
  }
}

// ----------------------
// CRUD Helpers
// ----------------------
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

export async function addLesson(lesson) {
  return db.lessons.add({ ...lesson, updatedAt: Date.now() });
}
export async function getLesson(id) {
  return db.lessons.get(id);
}
export async function getAllLessons() {
  return db.lessons.toArray();
}

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