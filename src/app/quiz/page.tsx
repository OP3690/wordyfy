'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Zap, ArrowLeft, Trophy, Star, Target, CheckCircle, XCircle, Play, 
  RotateCcw, Clock, Brain, Award, TrendingUp, RefreshCw, Loader2,
  Sparkles, Heart, Eye, EyeOff, Volume2, BookOpen, Timer
} from 'lucide-react';
import Link from 'next/link';
import { QuizQuestion } from '@/types/word';

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Timer and continuous quiz states
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [allWordsCompleted, setAllWordsCompleted] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuestions();
    
    const timeout = setTimeout(() => {
      if (loading) {
        setError('Quiz loading is taking too long. Please check your connection and try again.');
        setLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
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
  }, [timerActive, timeLeft]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/quiz');
      const data = await response.json();
      
      if (response.ok && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setTotalWords(data.questions.length);
        setTimerActive(true);
      } else {
        setError(data.error || 'Failed to load quiz questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setTimerActive(false);
    setSelectedAnswer('timeout');
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    setTimerActive(false);
    
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    // Clear timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(15);
      setTimerActive(true);
      setWordsCompleted(wordsCompleted + 1);
    } else {
      setGameCompleted(true);
      setAllWordsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameCompleted(false);
    setTimeLeft(15);
    setTimerActive(true);
    setWordsCompleted(0);
    setAllWordsCompleted(false);
    fetchQuestions();
  };

  const playPronunciation = (word: string, isHindi: boolean = false) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      
      const voices = speechSynthesis.getVoices();
      let femaleVoice;
      
      if (isHindi) {
        femaleVoice = voices.find(voice => 
          voice.lang.startsWith('hi') && 
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('woman'))
        ) || voices.find(voice => voice.lang.startsWith('hi'));
      } else {
        femaleVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('woman') ||
           voice.name.toLowerCase().includes('samantha'))
        );
      }
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return 'Outstanding! 🌟';
    if (percentage >= 80) return 'Excellent! 🎉';
    if (percentage >= 70) return 'Great job! 👏';
    if (percentage >= 60) return 'Good work! 👍';
    return 'Keep practicing! 💪';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Preparing Quiz</h2>
          <p className="text-gray-600">Loading questions for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchQuestions}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Again</span>
            </button>
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Words Available</h2>
          <p className="text-gray-600 mb-6">You need to add some words to your vault before taking a quiz.</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Add Words First
          </Link>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        {/* Floating Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative flex items-center justify-center min-h-screen px-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50 text-center">
            {/* Success Animation */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-4 w-4 text-yellow-800" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
            <p className="text-gray-600 mb-6">{getScoreMessage()}</p>
            
            {/* Score Display */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div className="text-4xl font-bold text-indigo-600 mb-2">{score}/{questions.length}</div>
              <div className="text-lg text-gray-600 mb-4">Correct Answers</div>
              <div className={`text-2xl font-bold ${getScoreColor()}`}>
                {Math.round((score / questions.length) * 100)}%
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Play Again</span>
              </button>
              <Link
                href="/dashboard"
                className="block w-full px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-105 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quiz</h1>
                <p className="text-xs text-gray-500">Test Your Knowledge</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Score</div>
                <div className="text-lg font-bold text-indigo-600">{score}/{questions.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-600">{currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl ${
            timeLeft <= 5 ? 'bg-red-100 text-red-700' : 
            timeLeft <= 10 ? 'bg-yellow-100 text-yellow-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            <Timer className="h-5 w-5" />
            <span className="text-lg font-bold">{timeLeft}s</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-200/50 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What is the Hindi translation for:
            </h2>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <h3 className="text-4xl font-bold text-indigo-600">
                {currentQ.englishWord.charAt(0).toUpperCase() + currentQ.englishWord.slice(1)}
              </h3>
              <button
                onClick={() => playPronunciation(currentQ.englishWord, false)}
                className="p-3 bg-blue-100 hover:bg-blue-200 rounded-2xl transition-colors shadow-sm hover:shadow-md"
                title="Play pronunciation"
              >
                <Volume2 className="h-6 w-6 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, index) => {
              let buttonClass = "w-full p-6 text-left rounded-2xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl ";
              
              if (showResult) {
                if (option === currentQ.correctAnswer) {
                  buttonClass += "bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-400 text-emerald-800";
                } else if (option === selectedAnswer && option !== currentQ.correctAnswer) {
                  buttonClass += "bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-400 text-red-800";
                } else {
                  buttonClass += "bg-gray-100 text-gray-600";
                }
              } else {
                buttonClass += "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-300 text-gray-800";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && option === currentQ.correctAnswer && (
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    )}
                    {showResult && option === selectedAnswer && option !== currentQ.correctAnswer && (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result Message */}
          {showResult && (
            <div className="mt-8 text-center">
              <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-2xl ${
                selectedAnswer === currentQ.correctAnswer 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedAnswer === currentQ.correctAnswer ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span className="font-bold">Incorrect</span>
                  </>
                )}
              </div>
              
              {selectedAnswer !== currentQ.correctAnswer && (
                <p className="mt-4 text-gray-600">
                  The correct answer is: <span className="font-bold text-indigo-600">{currentQ.correctAnswer}</span>
                </p>
              )}
              
              <button
                onClick={handleNextQuestion}
                className="mt-6 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
              >
                <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-gray-200/50 shadow-lg">
            <div className="text-2xl font-bold text-emerald-600">{score}</div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-gray-200/50 shadow-lg">
            <div className="text-2xl font-bold text-red-600">{currentQuestion - score}</div>
            <div className="text-sm text-gray-500">Incorrect</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-gray-200/50 shadow-lg">
            <div className="text-2xl font-bold text-indigo-600">{Math.round((score / Math.max(currentQuestion, 1)) * 100)}%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
        </div>
      </main>
    </div>
  );
}