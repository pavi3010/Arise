import React, { useState, useEffect } from 'react';

// Mock data since offlineQuizzes.json is not available
const offlineQuizzes = [
  {
    subject: "Mathematics",
    chapters: [
      {
        name: "Algebra",
        topics: [
          {
            name: "Linear Equations",
            quizzes: [
              {
                title: "Basic Linear Equations",
                difficulty: "easy",
                questions: [
                  {
                    question: "What is the value of x in: 2x + 5 = 13?",
                    options: ["3", "4", "5", "6"],
                    answer: "4"
                  },
                  {
                    question: "Solve for y: 3y - 7 = 14",
                    options: ["5", "6", "7", "8"],
                    answer: "7"
                  }
                ]
              },
              {
                title: "Intermediate Linear Equations",
                difficulty: "medium",
                questions: [
                  {
                    question: "If 4x - 3 = 13, what is x?",
                    options: ["2", "3", "4", "5"],
                    answer: "4"
                  },
                  {
                    question: "Solve for z: 5z + 2 = 27",
                    options: ["4", "5", "6", "7"],
                    answer: "5"
                  }
                ]
              },
              {
                title: "Challenging Linear Equations",
                difficulty: "hard",
                questions: [
                  {
                    question: "If 2x + 3 = 3x - 4, what is x?",
                    options: ["-7", "7", "-1", "1"],
                    answer: "7"
                  },
                  {
                    question: "Solve for y: 7y - 2 = 5y + 10",
                    options: ["6", "5", "7", "8"],
                    answer: "6"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    subject: "Science",
    chapters: [
      {
        name: "Physics",
        topics: [
          {
            name: "Motion",
            quizzes: [
              {
                title: "Basic Motion",
                difficulty: "easy",
                questions: [
                  {
                    question: "What is the formula for speed?",
                    options: ["Distance/Time", "Time/Distance", "Distance × Time", "Distance + Time"],
                    answer: "Distance/Time"
                  }
                ]
              },
              {
                title: "Intermediate Motion",
                difficulty: "medium",
                questions: [
                  {
                    question: "What is the SI unit of acceleration?",
                    options: ["m/s²", "m/s", "km/h", "N"],
                    answer: "m/s²"
                  }
                ]
              },
              {
                title: "Challenging Motion",
                difficulty: "hard",
                questions: [
                  {
                    question: "A car accelerates from 0 to 60 km/h in 5 seconds. What is its average acceleration in m/s²?",
                    options: ["3.33", "12", "60", "0.2"],
                    answer: "3.33"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Icons
const BookOpenIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Enhanced Selection Card Component
const SelectionCard = ({ title, subtitle, icon, gradient, onClick, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`group relative overflow-hidden rounded-3xl shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="relative p-6 flex items-center justify-between text-white">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon}
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
        </div>
        <ChevronRightIcon />
      </div>
      <div className="absolute inset-0 bg-white/5 transform translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ current, total }) => (
  <div className="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500 shadow-lg"
      style={{ width: `${(current / total) * 100}%` }}
    ></div>
  </div>
);

// Quiz Option Button
const QuizOption = ({ option, index, isSelected, isCorrect, isWrong, onClick, disabled }) => {
  const getButtonClass = () => {
    if (disabled) {
      if (isCorrect) return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg transform scale-105';
      if (isWrong) return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-lg';
      return 'bg-gray-100 text-gray-600 border-gray-200';
    }
    return 'bg-white bg-opacity-80 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:scale-102 border-gray-200 hover:border-blue-300 text-gray-800';
  };

  return (
    <button
      className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${getButtonClass()}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center gap-3">
        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
          disabled 
            ? isCorrect 
              ? 'bg-white text-green-600 border-white' 
              : isWrong 
                ? 'bg-white text-red-600 border-white'
                : 'bg-gray-300 text-gray-500 border-gray-300'
            : 'bg-blue-100 text-blue-600 border-blue-200'
        }`}>
          {disabled && isCorrect && <CheckIcon />}
          {disabled && isWrong && <XIcon />}
          {!disabled && String.fromCharCode(65 + index)}
        </span>
        <span className="flex-1">{option}</span>
      </div>
    </button>
  );
};

// Back Button Component
const BackButton = ({ onClick }) => (
  <button 
    className="group flex items-center gap-2 opacity-80 hover:opacity-100 font-medium px-4 py-2 rounded-xl transition-all duration-200
      hover:bg-white/20 focus:bg-white/20 active:bg-white/30
      text-white hover:text-white focus:text-white"
    onClick={onClick}
  >
    <span className="flex items-center">
      <ArrowLeftIcon />
    </span>
    <span className="font-semibold">Back</span>
  </button>
);

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
  const [quizStarted, setQuizStarted] = useState(false);

  const resetQuiz = () => {
    setStep(0);
    setSubjectIdx(null);
    setChapterIdx(null);
    setTopicIdx(null);
    setQuizIdx(null);
    setCurrentQuestion(0);
    setSelectedOptions([]);
    setShowResult(false);
    setScore(0);
    setQuizStarted(false);
  };

  const renderCurrentStep = () => {
    // Step 1: Subject Selection
    if (step === 1) {
      const subjectGradients = [
        'from-red-500 to-pink-600',
        'from-blue-500 to-indigo-600',
        'from-green-500 to-teal-600',
        'from-yellow-500 to-orange-600',
        'from-purple-500 to-violet-600',
        'from-cyan-500 to-blue-600'
      ];

      return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-blue-800 to-indigo-800 p-8 text-white shadow-2xl w-full h-full min-h-screen">
          <div className="absolute inset-0 opacity-50">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v20h20v-20c11.046 0 20-8.954 20-20s-8.954-20-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative min-h-screen flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <BackButton onClick={() => setStep(0)} />
              <h2 className="text-3xl font-bold text-center flex-1">Choose Your Subject</h2>
              <div className="w-20"></div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {offlineQuizzes.map((subject, idx) => (
                  <SelectionCard
                    key={subject.subject}
                    title={subject.subject}
                    subtitle={`${subject.chapters?.length || 0} chapters available`}
                    icon={<BookOpenIcon />}
                    gradient={subjectGradients[idx % subjectGradients.length]}
                    onClick={() => {
                      setSubjectIdx(idx);
                      setStep(2);
                    }}
                    delay={idx}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Chapter Selection
    if (step === 2 && subjectIdx !== null) {
      const chapters = offlineQuizzes[subjectIdx]?.chapters || [];
      const chapterGradients = [
        'from-emerald-500 to-teal-600',
        'from-blue-500 to-cyan-600',
        'from-purple-500 to-pink-600',
        'from-orange-500 to-red-600',
        'from-indigo-500 to-purple-600'
      ];

      return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-800 p-8 text-white shadow-2xl w-full h-full min-h-screen">
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z' fill-rule='evenodd'/%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative min-h-screen flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <BackButton onClick={() => setStep(1)} />
              <h2 className="text-3xl font-bold text-center flex-1">Select Chapter</h2>
              <div className="w-20"></div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {chapters.map((chapter, idx) => (
                  <SelectionCard
                    key={chapter.name}
                    title={chapter.name}
                    subtitle={`${chapter.topics?.length || 0} topics`}
                    icon={<BookOpenIcon />}
                    gradient={chapterGradients[idx % chapterGradients.length]}
                    onClick={() => {
                      setChapterIdx(idx);
                      setStep(3);
                    }}
                    delay={idx}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 3: Topic Selection
    if (step === 3 && subjectIdx !== null && chapterIdx !== null) {
      const topics = offlineQuizzes[subjectIdx]?.chapters[chapterIdx]?.topics || [];
      const topicGradients = [
        'from-violet-500 to-purple-600',
        'from-pink-500 to-rose-600',
        'from-blue-500 to-indigo-600',
        'from-green-500 to-emerald-600',
        'from-yellow-500 to-amber-600'
      ];

      return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-800 via-purple-700 to-pink-800 p-8 text-white shadow-2xl w-full h-full min-h-screen">
          <div className="relative min-h-screen flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <BackButton onClick={() => setStep(2)} />
              <h2 className="text-3xl font-bold text-center flex-1">Choose Topic</h2>
              <div className="w-20"></div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {topics.map((topic, idx) => (
                  <SelectionCard
                    key={topic.name}
                    title={topic.name}
                    subtitle={`${topic.quizzes?.length || 0} quizzes`}
                    icon={<BookOpenIcon />}
                    gradient={topicGradients[idx % topicGradients.length]}
                    onClick={() => {
                      setTopicIdx(idx);
                      setStep(4);
                    }}
                    delay={idx}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 4: Quiz Selection
    if (step === 4 && subjectIdx !== null && chapterIdx !== null && topicIdx !== null) {
      const quizzes = offlineQuizzes[subjectIdx]?.chapters[chapterIdx]?.topics[topicIdx]?.quizzes || [];

      return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-800 via-blue-700 to-cyan-800 p-8 text-white shadow-2xl w-full h-full min-h-screen">
          <div className="relative min-h-screen flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <BackButton onClick={() => setStep(3)} />
              <h2 className="text-3xl font-bold text-center flex-1">Select Quiz</h2>
              <div className="w-20"></div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {quizzes.map((quiz, idx) => (
                  <SelectionCard
                    key={quiz.title}
                    title={quiz.title}
                    subtitle={`${quiz.questions?.length || 0} questions`}
                    icon={<PlayIcon />}
                    gradient="from-green-500 to-emerald-600"
                    onClick={() => {
                      setQuizIdx(idx);
                      setCurrentQuestion(0);
                      setSelectedOptions([]);
                      setShowResult(false);
                      setScore(0);
                      setQuizStarted(true);
                      setStep(5);
                    }}
                    delay={idx}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 5: Quiz Playing
    if (step === 5 && subjectIdx !== null && chapterIdx !== null && topicIdx !== null && quizIdx !== null) {
      const quiz = offlineQuizzes[subjectIdx]?.chapters[chapterIdx]?.topics[topicIdx]?.quizzes[quizIdx];
      if (!quiz) return null;

      if (!showResult) {
        const currentQ = quiz.questions[currentQuestion];
        const hasAnswered = selectedOptions[currentQuestion] !== undefined;

        return (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-gray-700 to-slate-800 p-4 sm:p-8 text-white shadow-2xl w-full h-full min-h-screen flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
              {/* Progress and Back */}
              <div className="flex items-center justify-between mb-2">
                <BackButton onClick={() => setStep(4)} />
                <div className="flex-1 mx-4">
                  <ProgressBar current={currentQuestion + 1} total={quiz.questions.length} />
                  <div className="text-center">
                    <span className="text-sm opacity-60">Question {currentQuestion + 1} of {quiz.questions.length}</span>
                  </div>
                </div>
                <div className="w-20"></div>
              </div>

              {/* Question Card */}
              <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col items-center animate-fade-in">
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 text-center drop-shadow-lg animate-fade-in-up">{quiz.title}</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full mb-4 animate-pulse"></div>
                <p className="text-xl sm:text-2xl font-semibold text-white text-center leading-relaxed animate-fade-in-up" style={{textShadow:'0 2px 12px #0008'}}>{currentQ.question}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-5 mt-2">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOptions[currentQuestion] === idx;
                  const correctAnswerIndex = currentQ.options.findIndex(opt => opt === currentQ.answer);
                  const isCorrect = idx === correctAnswerIndex;
                  const isWrong = hasAnswered && isSelected && !isCorrect;

                  // Animated, colorful, card-like option
                  return (
                    <button
                      key={idx}
                      className={`relative flex items-center gap-4 px-6 py-5 rounded-2xl border-2 text-lg font-bold shadow-lg transition-all duration-300
                        ${hasAnswered
                          ? isCorrect
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-400 scale-105 shadow-emerald-400/40'
                            : isWrong
                              ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white border-red-400 scale-100 shadow-pink-400/40'
                              : 'bg-gray-100 text-gray-700 border-gray-200 opacity-80'
                          : 'bg-gradient-to-br from-white/80 to-blue-100/80 text-blue-900 border-blue-200 hover:scale-105 hover:shadow-xl hover:border-blue-400 focus:ring-2 focus:ring-blue-300'}
                        ${isSelected && !hasAnswered ? 'ring-4 ring-blue-300' : ''}
                        animate-fade-in-up`}
                      style={{transitionDelay: `${idx * 60}ms`}}
                      disabled={hasAnswered}
                      onClick={() => {
                        if (hasAnswered) return;
                        const newSelected = [...selectedOptions];
                        newSelected[currentQuestion] = idx;
                        setSelectedOptions(newSelected);
                        if (currentQ.answer === option) {
                          setScore(prev => prev + 1);
                        }
                        setTimeout(() => {
                          if (currentQuestion < quiz.questions.length - 1) {
                            setCurrentQuestion(prev => prev + 1);
                          } else {
                            setShowResult(true);
                          }
                        }, 1200);
                      }}
                    >
                      <span className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-lg font-extrabold
                        ${hasAnswered
                          ? isCorrect
                            ? 'bg-white text-green-600 border-green-400'
                            : isWrong
                              ? 'bg-white text-red-600 border-red-400'
                              : 'bg-gray-200 text-gray-700 border-gray-200'
                          : 'bg-blue-100 text-blue-600 border-blue-200'}
                        transition-all duration-300`}
                      >
                        {hasAnswered && isCorrect && <CheckIcon />}
                        {hasAnswered && isWrong && <XIcon />}
                        {!hasAnswered && String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`flex-1 text-left ${hasAnswered ? (isCorrect || isWrong ? 'text-white' : 'text-gray-700') : 'text-blue-900'}`}>{option}</span>
                      {/* Confetti or feedback icon */}
                      {hasAnswered && isCorrect && (
                        <span className="ml-2 text-2xl animate-bounce">🎉</span>
                      )}
                      {hasAnswered && isWrong && (
                        <span className="ml-2 text-2xl animate-shake">❌</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      // Quiz Results
      const percentage = Math.round((score / quiz.questions.length) * 100);
      const getGradeColor = () => {
        if (percentage >= 80) return 'from-green-500 to-emerald-600';
        if (percentage >= 60) return 'from-yellow-500 to-orange-600';
        return 'from-red-500 to-pink-600';
      };

      const getGradeText = () => {
        if (percentage >= 80) return 'Excellent!';
        if (percentage >= 60) return 'Good Job!';
        return 'Keep Trying!';
      };

      return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-gray-700 to-slate-800 p-8 text-white shadow-2xl w-full h-full min-h-screen">
          <div className="relative text-center min-h-screen flex flex-col items-center justify-center">
            <div className={`w-32 h-32 bg-gradient-to-br ${getGradeColor()} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <TrophyIcon />
            </div>
            
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Quiz Complete!
            </h2>
            
            <div className={`text-6xl font-bold mb-2 bg-gradient-to-r ${getGradeColor()} bg-clip-text text-transparent`}>
              {percentage}%
            </div>
            
            <p className="text-2xl opacity-80 mb-6">{getGradeText()}</p>

            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-200">
              <div className="text-lg mb-4 text-gray-900 font-semibold flex flex-wrap items-center justify-center gap-1">
                <span>Your Score:</span>
                <span className="font-bold text-2xl text-blue-700">{score}</span>
                <span>out of</span>
                <span className="font-bold text-2xl text-blue-700">{quiz.questions.length}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
              <button
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={resetQuiz}
              >
                Try Another Quiz
              </button>

              <button
                className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl border-2 border-gray-600 hover:bg-gray-800 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={() => {
                  // restart the same quiz
                  setCurrentQuestion(0);
                  setSelectedOptions([]);
                  setScore(0);
                  setShowResult(false);
                }}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // If quiz is active (step > 0), show as full screen overlay
  if (step > 0) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="min-h-full p-4 sm:p-6 lg:p-8">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    );
  }

  // Step 0: Welcome Screen
  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-8 text-white shadow-2xl w-full max-w-4xl h-screen mx-auto">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 bg-opacity-20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-16 w-12 h-12 bg-pink-300 bg-opacity-20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 right-32 w-8 h-8 bg-green-300 bg-opacity-20 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-orange-300 bg-opacity-20 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Geometric Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 right-10 w-24 h-24 border-2 border-white rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-16 left-20 w-32 h-32 border-2 border-pink-300 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 transform rotate-12 animate-pulse"></div>
        </div>

        {/* Main Content */}
        <div className="relative flex flex-col items-center text-center">
          {/* Animated Icon Container */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-white to-blue-100 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500 animate-pulse">
              <div className="relative">
                <PlayIcon />
                {/* Sparkle Effects */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
              </div>
            </div>
            {/* Floating Ring */}
            <div className="absolute inset-0 w-32 h-32 border-4 border-white border-opacity-30 rounded-3xl animate-spin" style={{ animationDuration: '15s' }}></div>
            {/* Glow Effect */}
            <div className="absolute inset-0 w-32 h-32 bg-white bg-opacity-20 rounded-3xl blur-xl animate-pulse"></div>
          </div>

          {/* Title with High Contrast and Animation */}
          <h2 className="text-5xl sm:text-6xl font-black mb-6 text-white drop-shadow-2xl">
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>O</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0.1s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>f</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0.2s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>f</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0.3s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>l</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0.4s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>i</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0.5s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>n</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0.6s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>e</span>
            <span className="inline-block mx-4"></span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0.7s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>Q</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0.8s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>u</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '0.9s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>i</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '1s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>z</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '1.1s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>z</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '1.2s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>e</span>
            <span className="inline-block animate-bounce text-shadow-lg" style={{ animationDelay: '1.3s', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>s</span>
          </h2>

          {/* Subtitle with High Contrast */}
          <p className="text-xl sm:text-2xl text-white drop-shadow-xl mb-10 leading-relaxed font-medium" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
            Test your knowledge with our comprehensive quiz collection. 
            <br />
            <span className="font-bold text-yellow-300 drop-shadow-lg">Challenge yourself and track your progress!</span>
          </p>

          {/* Simple Blue Button */}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            onClick={() => setStep(1)}
          >
            Start Quiz Journey
          </button>

          {/* Feature Icons */}
          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0s' }}>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">🧠</span>
              </div>
              <span className="text-sm text-white font-medium drop-shadow-lg">Smart</span>
            </div>
            <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0.5s' }}>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">⚡</span>
              </div>
              <span className="text-sm text-white font-medium drop-shadow-lg">Fast</span>
            </div>
            <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '1s' }}>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">🏆</span>
              </div>
              <span className="text-sm text-white font-medium drop-shadow-lg">Rewarding</span>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-4 left-4 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>💫</div>
        <div className="absolute top-8 right-8 text-3xl animate-pulse" style={{ animationDelay: '1s' }}>🌟</div>
        <div className="absolute bottom-4 left-8 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute bottom-8 right-4 text-3xl animate-pulse" style={{ animationDelay: '1.5s' }}>🎉</div>
      </div>
    </div>
  );
}