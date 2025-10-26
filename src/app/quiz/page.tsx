'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap, ArrowLeft, Trophy, Star, Target, CheckCircle, XCircle, Play, RotateCcw, Clock } from 'lucide-react';
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
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setError('Quiz loading is taking too long. Please check your connection and try again.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Time's up - automatically move to next question
      handleTimeUp();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, timerActive]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all user words for continuous quiz
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not logged in. Please sign in to play the quiz.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/words?userId=${userId}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      const userWords = data.words || [];
      setTotalWords(userWords.length);
      
      if (userWords.length < 4) {
        setError('You need at least 4 words to start the quiz. Add more words to your vault first!');
        setLoading(false);
        return;
      }

      // Create quiz questions from all user words
      const quizQuestions = createQuizFromUserWords(userWords);
      setQuestions(quizQuestions);
      setWordsCompleted(0);
      setAllWordsCompleted(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load quiz questions. Please try again.');
      setLoading(false);
    }
  };

  const createQuizFromStoredWords = (words: any[]) => {
    try {
      if (!words || !Array.isArray(words) || words.length === 0) {
        return [];
      }

      const questions: QuizQuestion[] = [];
      const usedWords = new Set();

      for (let i = 0; i < Math.min(5, words.length); i++) {
        let selectedWord;
        do {
          selectedWord = words[Math.floor(Math.random() * words.length)];
        } while (usedWords.has(selectedWord.englishWord) && usedWords.size < words.length);
        
        usedWords.add(selectedWord.englishWord);

        // Get 3 random incorrect options from other words
        const incorrectOptions = words
          .filter(w => w.englishWord !== selectedWord.englishWord)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => ({
            text: w.translation,
            isCorrect: false
          }));

        // Create options with correct answer
        const options = [
          { text: selectedWord.translation, isCorrect: true },
          ...incorrectOptions
        ].sort(() => Math.random() - 0.5);

        questions.push({
          _id: selectedWord._id || Date.now().toString(),
          englishWord: selectedWord.englishWord,
          correctAnswer: selectedWord.translation,
          options,
          difficulty: 'medium',
          createdAt: selectedWord.createdAt || new Date(),
          fromLanguage: selectedWord.fromLanguage || 'en',
          toLanguage: selectedWord.toLanguage || 'hi',
          popularity: selectedWord.popularity || 0
        });
      }

      return questions;
    } catch (error) {
      console.error('Error creating quiz from stored words:', error);
      return [];
    }
  };

  const createQuizFromUserWords = (words: any[]) => {
    try {
      if (!words || !Array.isArray(words) || words.length === 0) {
        return [];
      }

      // Create quiz questions for all user words
      const quizQuestions = words.map(word => {
        const otherWords = words.filter(w => w._id !== word._id);
        const shuffledOthers = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3);

        const options = [
          {
            text: word.translation,
            isCorrect: true
          },
          ...shuffledOthers.map((otherWord) => ({
            text: otherWord.translation,
            isCorrect: false
          }))
        ];

        const shuffledOptions = options.sort(() => 0.5 - Math.random());

        return {
          _id: word._id?.toString() || '',
          englishWord: word.englishWord,
          correctAnswer: word.translation,
          options: shuffledOptions,
          difficulty: 'medium' as const,
          createdAt: word.createdAt || new Date(),
          fromLanguage: word.fromLanguage || 'en',
          toLanguage: word.toLanguage || 'hi',
          popularity: word.popularity || 0
        };
      });

      // Shuffle the questions
      return quizQuestions.sort(() => 0.5 - Math.random());
    } catch (error) {
      console.error('Error creating quiz from user words:', error);
      return [];
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleTimeUp = () => {
    // Time's up - mark as incorrect and move to next question
    setShowResult(true);
    setTimerActive(false);
    // Don't increment score for time up, it's considered incorrect
    setTimeout(() => {
      handleNext();
    }, 1500); // Automatically move to next question after 1.5 seconds
  };

  const startTimer = () => {
    setTimeLeft(15);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setShowResult(true);
    stopTimer(); // Stop timer when answer is submitted
    
    const isCorrect = questions[currentQuestion].options.find(
      opt => opt.text === selectedAnswer
    )?.isCorrect;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleSubmitAndNext = async () => {
    if (!selectedAnswer) return;
    
    // Submit the answer
    setShowResult(true);
    stopTimer(); // Stop timer when answer is submitted
    
    const isCorrect = questions[currentQuestion].options.find(
      opt => opt.text === selectedAnswer
    )?.isCorrect;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Wait a moment to show the result, then move to next question
    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  const incrementReviewCount = async (englishWord: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const response = await fetch('/api/words/increment-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          englishWord: englishWord.toLowerCase(),
          userId: userId
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to increment review count');
      }
    } catch (error) {
      console.error('Error incrementing review count:', error);
    }
  };

  const handleNext = async () => {
    setWordsCompleted(prev => prev + 1);
    
    // Increment review count for the current word
    await incrementReviewCount(questions[currentQuestion].englishWord);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      startTimer(); // Start timer for next question
    } else {
      // All words completed
      setAllWordsCompleted(true);
      await saveQuizStats();
      setGameCompleted(true);
    }
  };

  const saveQuizStats = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const accuracy = Math.round((score / questions.length) * 100);
      
      await fetch('/api/quiz-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          quizScore: score,
          totalQuestions: questions.length,
          accuracy
        }),
      });
    } catch (error) {
      console.error('Failed to save quiz statistics:', error);
    }
  };

  const handleEndQuiz = async () => {
    // End quiz manually and show stats
    setAllWordsCompleted(true);
    await saveQuizStats();
    setGameCompleted(true);
    stopTimer();
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameCompleted(false);
    setWordsCompleted(0);
    setAllWordsCompleted(false);
    stopTimer();
    fetchQuestions();
  };

  const startQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameCompleted(false);
    setWordsCompleted(0);
    setAllWordsCompleted(false);
    startTimer();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-800 text-xl font-semibold">Loading Quiz...</p>
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

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Not Available</h2>
          <p className="text-gray-600 mb-6">You need at least 4 words to start the quiz. Add more words to your vault first!</p>
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

      if (gameCompleted) {
        const accuracy = Math.round((score / questions.length) * 100);
        const questionsAnswered = currentQuestion + 1;
        
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl max-w-lg w-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
              <p className="text-gray-600 mb-6">
                {allWordsCompleted 
                  ? `You've completed all ${totalWords} words in your vault!`
                  : `You answered ${questionsAnswered} out of ${questions.length} questions.`
                }
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-600">{score * 5}</div>
                  <div className="text-sm text-gray-600">XP Earned</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRestart}
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
  
  if (!currentQ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Error</h2>
          <p className="text-gray-600 mb-6">Unable to load current question</p>
          <button
            onClick={handleRestart}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }
  
  const isCorrect = selectedAnswer && currentQ.options.find(opt => opt.text === selectedAnswer)?.isCorrect;

  // Show start screen if quiz is ready but not started
  if (questions.length > 0 && !timerActive && currentQuestion === 0 && !showResult && !gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl max-w-2xl w-full text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <Target className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">Ready to Start Quiz?</h2>
          <p className="text-gray-600 text-lg sm:text-xl mb-6 sm:mb-8">
            You'll go through all {totalWords} words in your vault. Each question has a 15-second timer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 sm:mb-10">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{totalWords}</div>
              <div className="text-sm text-gray-600">Total Words</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">15s</div>
              <div className="text-sm text-gray-600">Per Question</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">Continuous</div>
              <div className="text-sm text-gray-600">Quiz Mode</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startQuiz}
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center space-x-3 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg sm:text-xl"
            >
              <Play className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Start Quiz</span>
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 text-lg sm:text-xl"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Back to Dashboard</span>
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
          <div className="flex justify-between items-center py-3 sm:py-4">
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Classic Quiz</h1>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              {/* Progress */}
              <div className="text-right">
                <div className="text-gray-700 text-xs sm:text-sm font-semibold">
                  {wordsCompleted} / {totalWords} words
                </div>
                <div className="text-gray-500 text-xs">
                  Q{currentQuestion + 1}/{questions.length}
                </div>
              </div>
              
              {/* Timer */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Clock className={`h-3 w-3 sm:h-4 sm:w-4 ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-600'}`} />
                <div className={`text-lg sm:text-xl font-bold transition-all duration-300 ${
                  timeLeft <= 5 
                    ? 'text-red-500 animate-pulse' 
                    : timeLeft <= 10 
                    ? 'text-yellow-500' 
                    : 'text-blue-500'
                }`}>
                  {timeLeft}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-16 sm:w-24 md:w-32 bg-gray-200 rounded-full h-2">
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
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className={`backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-12 border shadow-2xl transition-all duration-500 ${
          timeLeft <= 5 
            ? 'bg-red-50/90 border-red-200 shadow-red-200' 
            : 'bg-white/80 border-gray-200'
        }`}>
          {/* Question */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 md:mb-8 shadow-xl transition-all duration-500 ${
              timeLeft <= 5 
                ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              <Target className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 px-4">{currentQ.englishWord.charAt(0).toUpperCase() + currentQ.englishWord.slice(1)}</h2>
            <p className="text-gray-600 text-base sm:text-lg md:text-xl px-4">Choose the correct Hindi meaning</p>
            {timeLeft <= 5 && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                <Clock className="h-4 w-4" />
                <span>Time running out!</span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === option.text;
              const isCorrectOption = option.isCorrect;
              let buttonClass = "w-full p-3 sm:p-4 md:p-6 text-left rounded-xl sm:rounded-2xl border-2 transition-all font-semibold text-base sm:text-lg md:text-xl shadow-lg hover:shadow-xl min-h-[50px] sm:min-h-[60px] md:min-h-[80px] flex items-center";
              
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
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 ml-2" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {!showResult ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer}
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg sm:text-xl"
                  >
                    <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Submit Answer</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-3 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg sm:text-xl"
                  >
                    <span>{currentQuestion < questions.length - 1 ? 'Next Word' : 'Submit Quiz'}</span>
                    <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 rotate-180" />
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