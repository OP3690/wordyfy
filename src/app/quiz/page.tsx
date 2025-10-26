'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Trophy, CheckCircle, XCircle, Play, 
  RotateCcw, Clock, Brain, Award, TrendingUp, RefreshCw, 
  Loader2, Volume2, Timer, Star, Users, Target
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
    if (percentage >= 80) return 'text-green-600';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quiz Error</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchQuestions}
              className="w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors text-center"
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-6 w-6 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Words Available</h2>
          <p className="text-sm text-gray-600 mb-6">You need to add some words to your vault before taking a quiz.</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors"
          >
            Add Words First
          </Link>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-sm">
            {/* Success Animation */}
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Quiz Complete!</h1>
            <p className="text-sm text-gray-600 mb-4">{getScoreMessage()}</p>
            
            {/* Score Display */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="text-2xl font-bold text-blue-600 mb-1">{score}/{questions.length}</div>
              <div className="text-sm text-gray-600 mb-2">Correct Answers</div>
              <div className={`text-lg font-semibold ${getScoreColor()}`}>
                {Math.round((score / questions.length) * 100)}%
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleRestart}
                className="w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Play Again</span>
              </button>
              <Link
                href="/dashboard"
                className="block w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header - App-like */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="p-2 -ml-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Quiz</h1>
                <p className="text-xs text-gray-500">{currentQuestion + 1} of {questions.length}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">{score}/{questions.length}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Timer */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center">
          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl ${
            timeLeft <= 5 ? 'bg-red-100 text-red-700' : 
            timeLeft <= 10 ? 'bg-yellow-100 text-yellow-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            <Timer className="h-4 w-4" />
            <span className="text-sm font-semibold">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              What is the Hindi translation for:
            </h2>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <h3 className="text-xl font-bold text-blue-600">
                {currentQ.englishWord.charAt(0).toUpperCase() + currentQ.englishWord.slice(1)}
              </h3>
              <button
                onClick={() => playPronunciation(currentQ.englishWord, false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              let buttonClass = "w-full p-4 text-left rounded-xl font-medium text-sm transition-all ";
              
              if (showResult) {
                if (option.text === currentQ.correctAnswer) {
                  buttonClass += "bg-green-100 border-2 border-green-300 text-green-800";
                } else if (option.text === selectedAnswer && option.text !== currentQ.correctAnswer) {
                  buttonClass += "bg-red-100 border-2 border-red-300 text-red-800";
                } else {
                  buttonClass += "bg-gray-100 text-gray-600";
                }
              } else {
                buttonClass += "bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option.text)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.text}</span>
                    {showResult && option.text === currentQ.correctAnswer && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {showResult && option.text === selectedAnswer && option.text !== currentQ.correctAnswer && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result Message */}
          {showResult && (
            <div className="mt-6 text-center">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium ${
                selectedAnswer === currentQ.correctAnswer 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedAnswer === currentQ.correctAnswer ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Incorrect</span>
                  </>
                )}
              </div>
              
              {selectedAnswer !== currentQ.correctAnswer && (
                <p className="mt-3 text-sm text-gray-600">
                  The correct answer is: <span className="font-semibold text-blue-600">{currentQ.correctAnswer}</span>
                </p>
              )}
              
              <button
                onClick={handleNextQuestion}
                className="mt-4 px-6 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto"
              >
                <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-lg font-semibold text-green-600">{score}</div>
            <div className="text-xs text-gray-500">Correct</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-lg font-semibold text-red-600">{currentQuestion - score}</div>
            <div className="text-xs text-gray-500">Incorrect</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-lg font-semibold text-blue-600">{Math.round((score / Math.max(currentQuestion, 1)) * 100)}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}