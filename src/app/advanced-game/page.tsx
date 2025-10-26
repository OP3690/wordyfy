'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  ArrowLeft, 
  Trophy, 
  Star, 
  Target, 
  Users, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Clock,
  Puzzle,
  Building2,
  Gamepad2
} from 'lucide-react';
import Link from 'next/link';
import { QuizQuestion } from '@/types/word';

export default function AdvancedGame() {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<string>('');
  const [userWordCount, setUserWordCount] = useState<number>(0);
  const [gameMode, setGameMode] = useState<string>(''); // 'classic', 'word-builder', 'tower'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUser && storedUserId) {
      setUser(JSON.parse(storedUser));
      setUserId(storedUserId);
      checkAccess();
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, []);

  const checkAccess = async () => {
    try {
      setLoading(true);
      const fromLanguage = user?.fromLanguage || 'en';
      const toLanguage = user?.toLanguage || 'hi';
      const currentUserId = userId || localStorage.getItem('userId');
      const response = await fetch(`/api/advanced-game?fromLanguage=${fromLanguage}&toLanguage=${toLanguage}&userId=${currentUserId}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setAccessLevel(data.accessLevel || '');
      setUserWordCount(data.userWordCount || 0);
      setLoading(false);
    } catch (err) {
      setError('Failed to check access');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-800 text-xl font-semibold">Loading Advanced Game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAccessError = error.includes('requires at least 50 words');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isAccessError ? 'Access Restricted' : 'Game Not Available'}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {isAccessError && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">Advanced Quiz Access Levels:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 50-75 words: Basic (5 questions)</li>
                <li>• 76-125 words: Intermediate (10 questions)</li>
                <li>• 126-200 words: Advanced (25 questions)</li>
                <li>• 200+ words: Expert (50 questions)</li>
              </ul>
            </div>
          )}
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Game Selection Screen
  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Advanced Game</h1>
                  {accessLevel && (
                    <p className="text-sm text-gray-600">{accessLevel} • {userWordCount} words</p>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Game Selection */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Game Mode</h2>
            <p className="text-xl text-gray-600">Select your preferred game mode to start playing</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Classic Quiz */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                 onClick={() => setGameMode('classic')}>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Classic Quiz</h3>
                <p className="text-gray-600 mb-6">Multiple choice questions with 4 options. Test your vocabulary knowledge with community words.</p>
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-4 text-sm text-blue-700">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>10s timer</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Community words</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all">
                  Play Classic Quiz
                </button>
              </div>
            </div>

            {/* Word Builder */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                 onClick={() => setGameMode('word-builder')}>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Puzzle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Word Builder</h3>
                <p className="text-gray-600 mb-6">Unscramble letters to form English words. Get hints in Hindi to help you solve the puzzle.</p>
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-4 text-sm text-green-700">
                    <div className="flex items-center space-x-1">
                      <Puzzle className="h-4 w-4" />
                      <span>Anagram game</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>Hint system</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all">
                  Play Word Builder
                </button>
              </div>
            </div>

            {/* Wordy Streak Tower */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                 onClick={() => setGameMode('tower')}>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Wordy Streak Tower</h3>
                <p className="text-gray-600 mb-6">Build the tallest word tower! Each correct answer adds a block. Wrong answers make it shake.</p>
                <div className="bg-purple-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-4 text-sm text-purple-700">
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>Visual tower</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>Weekly leaderboard</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all">
                  Build Tower
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Render specific game mode
  if (gameMode === 'classic') {
    return <ClassicQuiz user={user} userId={userId} accessLevel={accessLevel} userWordCount={userWordCount} />;
  } else if (gameMode === 'word-builder') {
    return <WordBuilder user={user} userId={userId} accessLevel={accessLevel} userWordCount={userWordCount} />;
  } else if (gameMode === 'tower') {
    return <WordyStreakTower user={user} userId={userId} accessLevel={accessLevel} userWordCount={userWordCount} />;
  }

  return null;
}

// Classic Quiz Component
function ClassicQuiz({ user, userId, accessLevel, userWordCount }: any) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleTimeUp();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, timerActive]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const fromLanguage = user?.fromLanguage || 'en';
      const toLanguage = user?.toLanguage || 'hi';
      const currentUserId = userId || localStorage.getItem('userId');
      const response = await fetch(`/api/advanced-game?fromLanguage=${fromLanguage}&toLanguage=${toLanguage}&userId=${currentUserId}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setQuestions(data.questions);
      
      if (data.questions && data.questions.length > 0) {
        startTimer();
      }
    } catch (err) {
      setError('Failed to load game questions');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setTimerActive(false);
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const startTimer = () => {
    setTimeLeft(10);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setShowResult(true);
    stopTimer();
    
    const isCorrect = questions[currentQuestion].options.find(
      opt => opt.text === selectedAnswer
    )?.isCorrect;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      startTimer();
    } else {
      setGameCompleted(true);
    }
  };

  const handleEndQuiz = () => {
    setGameCompleted(true);
    stopTimer();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-800 text-xl font-semibold">Loading Classic Quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchQuestions}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    const accuracy = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Classic Quiz Complete!</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Score:</span>
              <span className="text-2xl font-bold text-gray-800">{score}/{questions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Accuracy:</span>
              <span className="text-2xl font-bold text-gray-800">{accuracy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">XP Earned:</span>
              <span className="text-2xl font-bold text-blue-600">{score * 10}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Play Again</span>
            </button>
            <Link
              href="/dashboard"
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isCorrect = selectedAnswer && currentQ.options.find(opt => opt.text === selectedAnswer)?.isCorrect;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Classic Quiz</h1>
                {accessLevel && (
                  <p className="text-sm text-gray-600">{accessLevel} • {userWordCount} words</p>
                )}
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              {/* Progress */}
              <div className="text-right">
                <div className="text-gray-700 text-sm font-semibold">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
              </div>
              
              {/* Timer */}
              <div className="flex items-center space-x-2">
                <Clock className={`h-4 w-4 ${timeLeft <= 3 ? 'text-red-500' : 'text-gray-600'}`} />
                <div className={`text-xl font-bold transition-all duration-300 ${
                  timeLeft <= 3 
                    ? 'text-red-500 animate-pulse' 
                    : timeLeft <= 5 
                    ? 'text-yellow-500' 
                    : 'text-blue-500'
                }`}>
                  {timeLeft}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              
              {/* End Quiz Button */}
              <button
                onClick={handleEndQuiz}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-300"
              >
                End Quiz
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`backdrop-blur-md rounded-3xl p-8 border shadow-2xl transition-all duration-500 ${
          timeLeft <= 3 
            ? 'bg-red-50/90 border-red-200 shadow-red-200' 
            : 'bg-white/80 border-gray-200'
        }`}>
          {/* Question */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-xl transition-all duration-500 ${
              timeLeft <= 3 
                ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              <Target className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{currentQ.englishWord}</h2>
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{currentQ.popularity} users</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Popular</span>
              </div>
            </div>
            {timeLeft <= 3 && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                <Clock className="h-4 w-4" />
                <span>Time running out!</span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid gap-4 mb-8">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === option.text;
              const isCorrectOption = option.isCorrect;
              let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all font-semibold text-lg shadow-lg hover:shadow-xl min-h-[60px] flex items-center";
              
              if (showResult) {
                if (isCorrectOption) {
                  buttonClass += " bg-green-100 border-green-400 text-green-800 shadow-green-200";
                } else if (isSelected && !isCorrectOption) {
                  buttonClass += " bg-red-100 border-red-400 text-red-800 shadow-red-200";
                } else {
                  buttonClass += " bg-gray-100 border-gray-300 text-gray-500";
                }
              } else if (isSelected) {
                buttonClass += " bg-blue-100 border-blue-400 text-blue-800 shadow-blue-200";
              } else {
                buttonClass += " bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option.text)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-left flex-1">{option.text}</span>
                    {showResult && isCorrectOption && (
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <Play className="h-5 w-5" />
                <span>Submit Answer</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Game'}</span>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            )}
          </div>
          
          {/* Manual End Quiz Option */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm mb-2">Want to end the quiz early?</p>
            <button
              onClick={handleEndQuiz}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all duration-300"
            >
              End Quiz Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Word Builder Component
function WordBuilder({ user, userId, accessLevel, userWordCount }: any) {
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    fetchWord();
  }, []);

  const fetchWord = async () => {
    try {
      setLoading(true);
      const fromLanguage = user?.fromLanguage || 'en';
      const toLanguage = user?.toLanguage || 'hi';
      const currentUserId = userId || localStorage.getItem('userId');
      const response = await fetch(`/api/advanced-game?fromLanguage=${fromLanguage}&toLanguage=${toLanguage}&userId=${currentUserId}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.questions && data.questions.length > 0) {
        const randomWord = data.questions[Math.floor(Math.random() * data.questions.length)];
        setCurrentWord(randomWord);
        scrambleWord(randomWord.englishWord);
      }
    } catch (err) {
      setError('Failed to load word');
    } finally {
      setLoading(false);
    }
  };

  const scrambleWord = (word: string) => {
    const letters = word.split('');
    const scrambled = letters.sort(() => Math.random() - 0.5);
    setScrambledLetters(scrambled);
    setUserInput('');
    setShowHint(false);
    setIsCorrect(null);
  };

  const handleSubmit = () => {
    if (userInput.toLowerCase() === currentWord.englishWord.toLowerCase()) {
      setIsCorrect(true);
      setScore(prev => prev + 1);
      setTimeout(() => {
        fetchWord();
      }, 2000);
    } else {
      setIsCorrect(false);
    }
  };

  const handleEndGame = () => {
    setGameCompleted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Puzzle className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-800 text-xl font-semibold">Loading Word Builder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Game</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchWord}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Puzzle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Word Builder Complete!</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Words Solved:</span>
              <span className="text-2xl font-bold text-gray-800">{score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">XP Earned:</span>
              <span className="text-2xl font-bold text-green-600">{score * 15}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Play Again</span>
            </button>
            <Link
              href="/dashboard"
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <Puzzle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Word Builder</h1>
                {accessLevel && (
                  <p className="text-sm text-gray-600">{accessLevel} • {userWordCount} words</p>
                )}
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-gray-700 text-sm font-semibold">Score: {score}</div>
              </div>
              <button
                onClick={handleEndGame}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-300"
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-2xl">
          {/* Scrambled Letters */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Puzzle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Unscramble the letters to form a word:</h2>
            <div className="flex justify-center space-x-4 mb-8">
              {scrambledLetters.map((letter, index) => (
                <div
                  key={index}
                  className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl flex items-center justify-center text-xl font-bold text-green-800 shadow-lg"
                >
                  {letter.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* User Input */}
          <div className="text-center mb-8">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full max-w-md px-6 py-4 text-xl font-semibold text-center border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300"
              disabled={isCorrect !== null}
            />
          </div>

          {/* Hint */}
          {showHint && (
            <div className="text-center mb-6">
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <p className="text-yellow-800 font-semibold">
                  <span className="font-bold">Hint:</span> Hindi meaning is "{currentWord.correctAnswer}"
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {isCorrect !== null && (
            <div className="text-center mb-6">
              {isCorrect ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-800 font-semibold">
                    <CheckCircle className="h-6 w-6" />
                    <span>Correct! Well done!</span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 text-red-800 font-semibold">
                    <XCircle className="h-6 w-6" />
                    <span>Incorrect. Try again!</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim() || isCorrect !== null}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <Play className="h-5 w-5" />
              <span>Submit</span>
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center space-x-2 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <Star className="h-5 w-5" />
              <span>Hint</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wordy Streak Tower Component
function WordyStreakTower({ user, userId, accessLevel, userWordCount }: any) {
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [towerHeight, setTowerHeight] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetchWord();
  }, []);

  const fetchWord = async () => {
    try {
      setLoading(true);
      const fromLanguage = user?.fromLanguage || 'en';
      const toLanguage = user?.toLanguage || 'hi';
      const currentUserId = userId || localStorage.getItem('userId');
      const response = await fetch(`/api/advanced-game?fromLanguage=${fromLanguage}&toLanguage=${toLanguage}&userId=${currentUserId}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.questions && data.questions.length > 0) {
        const randomWord = data.questions[Math.floor(Math.random() * data.questions.length)];
        setCurrentWord(randomWord);
      }
    } catch (err) {
      setError('Failed to load word');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (userInput.toLowerCase() === currentWord.englishWord.toLowerCase()) {
      setIsCorrect(true);
      setTowerHeight(prev => prev + 1);
      setTimeout(() => {
        setUserInput('');
        setIsCorrect(null);
        setShowHint(false);
        setShowAnswer(false);
        fetchWord();
      }, 2000);
    } else {
      setIsCorrect(false);
      // Tower shakes but doesn't fall
      setTimeout(() => {
        setIsCorrect(null);
      }, 1500);
    }
  };

  const handleEndGame = () => {
    setGameCompleted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-800 text-xl font-semibold">Loading Wordy Streak Tower...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Game</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchWord}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tower Complete!</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tower Height:</span>
              <span className="text-2xl font-bold text-gray-800">{towerHeight} blocks</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">XP Earned:</span>
              <span className="text-2xl font-bold text-purple-600">{towerHeight * 20}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Build Again</span>
            </button>
            <Link
              href="/dashboard"
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Wordy Streak Tower</h1>
                {accessLevel && (
                  <p className="text-sm text-gray-600">{accessLevel} • {userWordCount} words</p>
                )}
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-gray-700 text-sm font-semibold">Tower: {towerHeight} blocks</div>
              </div>
              <button
                onClick={handleEndGame}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-300"
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tower Visualization */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Tower</h3>
            <div className="flex flex-col items-center space-y-2 min-h-[300px] justify-end">
              {Array.from({ length: towerHeight }, (_, index) => (
                <div
                  key={index}
                  className={`w-16 h-8 rounded-lg shadow-lg transition-all duration-500 ${
                    index % 3 === 0 
                      ? 'bg-gradient-to-r from-purple-400 to-purple-600' 
                      : index % 3 === 1 
                      ? 'bg-gradient-to-r from-pink-400 to-pink-600' 
                      : 'bg-gradient-to-r from-indigo-400 to-indigo-600'
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    transform: isCorrect === false ? 'translateX(10px) translateX(-10px)' : 'translateX(0)',
                    transition: 'transform 0.3s ease-in-out'
                  }}
                />
              ))}
              {towerHeight === 0 && (
                <div className="text-gray-400 text-center">
                  <Building2 className="h-16 w-16 mx-auto mb-2" />
                  <p>Start building your tower!</p>
                </div>
              )}
            </div>
          </div>

          {/* Word Input */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">What does this mean?</h2>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                <p className="text-3xl font-bold text-purple-800">{currentWord.correctAnswer}</p>
                <p className="text-sm text-purple-600 mt-2">Hindi Translation</p>
              </div>
            </div>

            {/* User Input */}
            <div className="mb-6">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the English word..."
                className="w-full px-6 py-4 text-xl font-semibold text-center border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300"
                disabled={isCorrect !== null}
              />
            </div>

            {/* Hint */}
            {showHint && (
              <div className="mb-6">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <p className="text-yellow-800 font-semibold text-center">
                    <span className="font-bold">Hint:</span> The word starts with "{currentWord.englishWord[0].toUpperCase()}"
                  </p>
                </div>
              </div>
            )}

            {/* Show Answer */}
            {showAnswer && (
              <div className="mb-6">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                  <p className="text-blue-800 font-semibold text-center">
                    <span className="font-bold">Answer:</span> {currentWord.englishWord.charAt(0).toUpperCase() + currentWord.englishWord.slice(1)}
                  </p>
                </div>
              </div>
            )}

            {/* Result */}
            {isCorrect !== null && (
              <div className="mb-6">
                {isCorrect ? (
                  <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                    <div className="flex items-center justify-center space-x-2 text-green-800 font-semibold">
                      <CheckCircle className="h-6 w-6" />
                      <span>Correct! Tower grows! 🏗️</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                    <div className="flex items-center justify-center space-x-2 text-red-800 font-semibold">
                      <XCircle className="h-6 w-6" />
                      <span>Tower shakes! Try again! 💥</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim() || isCorrect !== null}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <Building2 className="h-5 w-5" />
                <span>Build Block</span>
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center space-x-2 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <Star className="h-5 w-5" />
                <span>Hint</span>
              </button>
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center space-x-2 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <Target className="h-5 w-5" />
                <span>Show Answer</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}