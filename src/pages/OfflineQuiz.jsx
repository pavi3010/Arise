import React, { useState } from 'react';
import offlineQuizzes from '../data/offlineQuizzes.json';


export default function OfflineQuiz() {
  const [step, setStep] = useState(0);
  const [subjectIdx, setSubjectIdx] = useState(null);
  const [chapterIdx, setChapterIdx] = useState(null);
  const [topicIdx, setTopicIdx] = useState(null);
  const [quizIdx, setQuizIdx] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Step 0: Start
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <h2 className="text-2xl font-bold mb-4">Offline Quizzes</h2>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition mb-6"
          onClick={() => setStep(1)}
        >
          Attend a Quiz
        </button>
      </div>
    );
  }

  // Step 1: Select Subject
  if (step === 1) {
    return (
      <div className="flex flex-col items-center min-h-[300px]">
        <button className="self-start mb-4 text-blue-600 hover:underline" onClick={() => setStep(0)}>&larr; Back</button>
        <h2 className="text-xl font-bold mb-4">Select a Subject</h2>
        <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {offlineQuizzes.map((subject, idx) => (
            <button
              key={subject.subject}
              className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:bg-blue-50 text-left"
              onClick={() => {
                setSubjectIdx(idx);
                setStep(2);
              }}
            >
              <span className="font-semibold text-blue-700">{subject.subject}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Select Chapter
  if (step === 2 && subjectIdx !== null) {
    const chapters = offlineQuizzes[subjectIdx]?.chapters || [];
    return (
      <div className="flex flex-col items-center min-h-[300px]">
        <button className="self-start mb-4 text-blue-600 hover:underline" onClick={() => setStep(1)}>&larr; Back</button>
        <h2 className="text-xl font-bold mb-4">Select a Chapter</h2>
        <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((chapter, idx) => (
            <button
              key={chapter.name}
              className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:bg-blue-50 text-left"
              onClick={() => {
                setChapterIdx(idx);
                setStep(3);
              }}
            >
              <span className="font-semibold text-blue-700">{chapter.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Select Topic
  if (step === 3 && subjectIdx !== null && chapterIdx !== null) {
    const topics = offlineQuizzes[subjectIdx]?.chapters[chapterIdx]?.topics || [];
    return (
      <div className="flex flex-col items-center min-h-[300px]">
        <button className="self-start mb-4 text-blue-600 hover:underline" onClick={() => setStep(2)}>&larr; Back</button>
        <h2 className="text-xl font-bold mb-4">Select a Topic</h2>
        <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic, idx) => (
            <button
              key={topic.name}
              className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:bg-blue-50 text-left"
              onClick={() => {
                setTopicIdx(idx);
                setStep(4);
              }}
            >
              <span className="font-semibold text-blue-700">{topic.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 4: Select Quiz
  if (step === 4 && subjectIdx !== null && chapterIdx !== null && topicIdx !== null) {
    const quizzes = offlineQuizzes[subjectIdx]?.chapters[chapterIdx]?.topics[topicIdx]?.quizzes || [];
    return (
      <div className="flex flex-col items-center min-h-[300px]">
        <button className="self-start mb-4 text-blue-600 hover:underline" onClick={() => setStep(3)}>&larr; Back</button>
        <h2 className="text-xl font-bold mb-4">Select a Quiz</h2>
        <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz, idx) => (
            <button
              key={quiz.title}
              className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:bg-green-50 text-left"
              onClick={() => {
                setQuizIdx(idx);
                setCurrentQuestion(0);
                setSelectedOptions([]);
                setShowResult(false);
                setScore(0);
                setStep(5);
              }}
            >
              <span className="font-semibold text-green-700">{quiz.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 5 && subjectIdx !== null && chapterIdx !== null && topicIdx !== null && quizIdx !== null) {
    const quiz = offlineQuizzes[subjectIdx]?.chapters[chapterIdx]?.topics[topicIdx]?.quizzes[quizIdx];
    if (!quiz) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <button
          className="self-start mb-4 text-blue-600 hover:underline"
          onClick={() => setStep(4)}
        >
          &larr; Back to Quizzes
        </button>
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-xl">
          <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
          {!showResult ? (
            <>
              <div className="mb-4 text-gray-700">
                Q{currentQuestion + 1}. {quiz.questions[currentQuestion].question}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {quiz.questions[currentQuestion].options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`px-4 py-2 rounded border text-left transition-all
                      ${selectedOptions[currentQuestion] === idx
                        ? idx === quiz.questions[currentQuestion].answer
                          ? 'bg-green-200 border-green-500'
                          : 'bg-red-200 border-red-500'
                        : 'bg-gray-100 border-gray-300 hover:bg-blue-100'}
                    `}
                    onClick={() => {
                      if (selectedOptions[currentQuestion] !== undefined) return;
                      const newSelected = [...selectedOptions];
                      newSelected[currentQuestion] = idx;
                      setSelectedOptions(newSelected);
                      if (
                        quiz.questions[currentQuestion].answer ===
                        quiz.questions[currentQuestion].options[idx]
                      ) {
                        setScore((prev) => prev + 1);
                      }
                      setTimeout(() => {
                        if (currentQuestion < quiz.questions.length - 1) {
                          setCurrentQuestion((prev) => prev + 1);
                        } else {
                          setShowResult(true);
                        }
                      }, 500);
                    }}
                    disabled={selectedOptions[currentQuestion] !== undefined}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-gray-500">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold mb-2">Quiz Complete!</div>
              <div className="text-lg mb-4">
                Your Score: <span className="font-bold">{score} / {quiz.questions.length}</span>
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  setStep(0);
                  setSubjectIdx(null);
                  setChapterIdx(null);
                  setTopicIdx(null);
                  setQuizIdx(null);
                  setCurrentQuestion(0);
                  setSelectedOptions([]);
                  setShowResult(false);
                  setScore(0);
                }}
              >
                Back to Start
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
