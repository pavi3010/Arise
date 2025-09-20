// src/components/WebShareContentButton.jsx
import React from 'react';
import { exportContent } from '../utils/db';

export default function WebShareContentButton() {
  const handleShare = async () => {
    // Export all content as a blob
    const [allQuizzes, allLessons, allGames] = await Promise.all([
      window.db.quizzes.toArray(),
      window.db.lessons.toArray(),
      window.db.games.toArray()
    ]);
    const exportObj = {
      quizzes: allQuizzes,
      lessons: allLessons,
      games: allGames,
      exportedAt: Date.now()
    };
    const json = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], `arise-content-export-${new Date().toISOString().slice(0,10)}.json`, { type: 'application/json' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Arise Content',
          text: 'Share lessons, quizzes, and games with a friend!'
        });
      } catch (err) {
        alert('Share cancelled or failed.');
      }
    } else {
      alert('Web Share API with file support is not available on this device. Use Export instead.');
    }
  };

  return (
    <button
      className="px-4 py-2 bg-pink-600 text-white rounded-lg shadow hover:bg-pink-700 transition"
      onClick={handleShare}
    >
      Share All Content (Web Share)
    </button>
  );
}
