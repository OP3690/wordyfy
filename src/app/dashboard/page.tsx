'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Volume2, CheckCircle, AlertCircle, Loader2,
  BookOpen, Trophy, MessageSquare, LogOut, CalendarDays, TrendingUp,
  Award, Brain, ArrowRight, Star, Users, Target, X, Save
} from 'lucide-react';
import Link from 'next/link';
import { saveWord, getStoredWords } from '@/lib/storage';
import { Word } from '@/types/word';
import InstallPrompt from '@/components/InstallPrompt';
import { getUserSession, clearUserSession } from '@/lib/auth';

export default function Dashboard() {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null);
  const [storedWords, setStoredWords] = useState<Word[]>([]);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentWordData, setCurrentWordData] = useState<any>(null);
  
  // Quick Add popup states
  const [showQuickAddPopup, setShowQuickAddPopup] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  
  // Statistics states
  const [wordsAddedToday, setWordsAddedToday] = useState(0);
  const [wordsAddedLast7Days, setWordsAddedLast7Days] = useState(0);
  const [wordsAddedThisMonth, setWordsAddedThisMonth] = useState(0);
  
  // Spelling suggestion states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidWord, setIsValidWord] = useState(true);

  // Quiz stats states
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    averageAccuracy: 0,
    currentStreak: 0,
    longestStreak: 0
  });


  const clearMessage = () => {
    setMessage('');
    setShowPopup(false);
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      setMessageTimeout(null);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickAddText.trim() || !userId) return;

    try {
      setQuickAddLoading(true);
      setMessage('');
      
      const response = await fetch('/api/sentences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: quickAddText.trim(),
          type: 'text', // Always save as 'text' for quick add
          userId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Text added successfully!');
        setQuickAddText('');
        setShowQuickAddPopup(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to add text');
      }
    } catch (error) {
      console.error('Error adding text:', error);
      setMessage('Failed to add text');
    } finally {
      setQuickAddLoading(false);
    }
  };

  const setMessageWithTimeout = (msg: string) => {
    clearMessage();
    setMessage(msg);
    if ((msg.includes('✅') || msg.includes('ℹ️')) && msg.includes('Hindi:')) {
      setShowPopup(true);
    }
    const timeout = setTimeout(() => {
      setMessage('');
      setShowPopup(false);
      setMessageTimeout(null);
    }, 8000);
    setMessageTimeout(timeout);
  };

  // Common misspellings fallback
  const commonMisspellings: { [key: string]: string[] } = {
    'happpy': ['happy'],
    'recieve': ['receive'],
    'seperate': ['separate'],
    'definately': ['definitely'],
    'occured': ['occurred'],
    'begining': ['beginning'],
    'beleive': ['believe'],
    'neccessary': ['necessary'],
    'accomodate': ['accommodate'],
    'embarass': ['embarrass'],
    'maintainance': ['maintenance'],
    'priviledge': ['privilege'],
    'rythm': ['rhythm'],
    'succesful': ['successful'],
    'untill': ['until'],
    'writting': ['writing'],
    'existance': ['existence'],
    'occassion': ['occasion'],
    'recomend': ['recommend'],
    'acheive': ['achieve'],
    'ironnn': ['iron'],
    'ironn': ['iron'],
    'irron': ['iron'],
    'appple': ['apple'],
    'appel': ['apple'],
    'aple': ['apple'],
    'yelllow': ['yellow'],
    'yello': ['yellow'],
    'yelow': ['yellow'],
    'visiblle': ['visible'],
    'visibl': ['visible'],
    'visable': ['visible']
  };

  // Original working spelling suggestion function
  const getSpellingSuggestions = async (word: string) => {
    if (!word || word.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidWord(true);
      return;
    }

    const lowerWord = word.toLowerCase();
    
    // Check common misspellings first (instant response)
    if (commonMisspellings[lowerWord]) {
      const misspellingSuggestions = commonMisspellings[lowerWord];
      setSuggestions(misspellingSuggestions);
      setShowSuggestions(true);
      
      // Check if the current word matches any of the suggestions
      const wordMatchesSuggestion = misspellingSuggestions.some((suggestion: string) => 
        suggestion.toLowerCase() === lowerWord
      );
      
      setIsValidWord(wordMatchesSuggestion);
      return;
    }

    try {
      // Try to get suggestions from Datamuse API
      const suggestionsResponse = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(word)}&max=5`);
      
      if (!suggestionsResponse.ok) {
        throw new Error(`Datamuse API error: ${suggestionsResponse.status}`);
      }
      
      const suggestionsData = await suggestionsResponse.json();
      
      if (suggestionsData && suggestionsData.length > 0) {
        const suggestionWords = suggestionsData.map((item: any) => item.word);
        
        setSuggestions(suggestionWords);
        setShowSuggestions(true);
        
        // Check if the current word matches any of the suggestions
        const wordMatchesSuggestion = suggestionWords.some((suggestion: string) => 
          suggestion.toLowerCase() === lowerWord
        );
        
        setIsValidWord(wordMatchesSuggestion);
        return;
      }

      // If no suggestions from Datamuse, check dictionary
      const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const isValid = dictResponse.ok;
      setIsValidWord(isValid);

      if (isValid) {
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error checking spelling:', error);
      setIsValidWord(true);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };


  const selectSuggestion = (suggestion: string) => {
    setWord(suggestion);
      setSuggestions([]);
      setShowSuggestions(false);
    setIsValidWord(true);
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

  useEffect(() => {
    setMounted(true);
    
    // Use persistent login system
    const { user: userData, userId: storedUserId, rememberMe } = getUserSession();
    
    if (userData && storedUserId) {
        setUser(userData);
        setUserId(storedUserId);
        loadUserWords(storedUserId);
      loadQuizStats(storedUserId);
    } else {
      // No valid session found, redirect to login
      window.location.href = '/login';
    }
    
    setMessage('');
  }, []);

  // Refresh quiz stats when returning from quiz or page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const { userId: storedUserId } = getUserSession();
        if (storedUserId) {
          console.log('🔄 Page became visible, refreshing quiz stats...');
          loadQuizStats(storedUserId);
        }
      }
    };

    const handleFocus = () => {
      const { userId: storedUserId } = getUserSession();
      if (storedUserId) {
        console.log('🔄 Window focused, refreshing quiz stats...');
        loadQuizStats(storedUserId);
      }
    };

    const handleQuizStatsUpdate = () => {
      const { userId: storedUserId } = getUserSession();
      if (storedUserId) {
        console.log('🔄 Quiz stats updated event received, refreshing...');
        loadQuizStats(storedUserId);
      }
    };

    // Listen for visibility change, focus, and custom quiz stats update events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('quizStatsUpdated', handleQuizStatsUpdate);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('quizStatsUpdated', handleQuizStatsUpdate);
    };
  }, []);

  const loadUserWords = async (userId: string) => {
    try {
      const response = await fetch(`/api/words?userId=${userId}`);
      const data = await response.json();
      
      const words = data.words || [];
      setStoredWords(words);
      
      // Calculate statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setWordsAddedToday(words.filter((w: Word) => new Date(w.createdAt) >= today).length);
      setWordsAddedLast7Days(words.filter((w: Word) => new Date(w.createdAt) >= last7Days).length);
      setWordsAddedThisMonth(words.filter((w: Word) => new Date(w.createdAt) >= thisMonth).length);
    } catch (error) {
      console.error('Error loading user words:', error);
      const storedWords = getStoredWords();
      setStoredWords(storedWords);
    }
  };

  const loadQuizStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/quiz-stats?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok && data.stats) {
        setQuizStats({
          totalQuizzes: data.stats.totalQuizzes || 0,
          totalQuestions: data.stats.totalQuestions || 0,
          correctAnswers: data.stats.correctAnswers || 0,
          averageAccuracy: data.stats.averageAccuracy || 0,
          currentStreak: data.stats.currentStreak || 0,
          longestStreak: data.stats.longestStreak || 0
        });
      }
    } catch (error) {
      console.error('Error loading quiz stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim()) {
      return;
    }
    
    // Check if userId is available
    if (!userId) {
      console.error('No userId available');
      setMessageWithTimeout('❌ Error: User not logged in. Please refresh the page.');
      return;
    }

    const trimmedWord = word.trim().toLowerCase();
    
    // Check if word already exists
    const existingWord = storedWords.find(w => 
      w.englishWord.toLowerCase() === trimmedWord
    );
    
    if (existingWord) {
      setMessageWithTimeout(`ℹ️ "${trimmedWord}" already in your vault! Hindi: ${existingWord.translation || existingWord.hindiTranslation || 'N/A'}`);
      
      // Show word details for already-added words
      setCurrentWordData({
        word: existingWord.englishWord,
        translation: existingWord.translation || existingWord.hindiTranslation || 'N/A',
        definition: (existingWord as any).definition || 'No definition available',
        example: (existingWord as any).example || 'No example available',
        synonyms: (existingWord as any).synonyms || [],
        antonyms: (existingWord as any).antonyms || [],
        pronunciation: existingWord.pronunciation || '',
        partOfSpeech: existingWord.partOfSpeech || '',
        audioUrl: existingWord.audioUrl || '',
        phonetics: existingWord.phonetics || [],
        meanings: existingWord.meanings || []
      });
      
      setWord('');
      setShowSuggestions(false);
      setIsValidWord(true);
      return;
    }

    // Always allow adding the word, regardless of suggestions
    setLoading(true);
    setMessage('');
    setShowSuggestions(false);
    setIsValidWord(true);

    console.log('Adding word:', { word: trimmedWord, userId: userId });

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          englishWord: trimmedWord,
          userId: userId
        }),
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      if (response.ok) {
        console.log('Word added successfully:', data.word);
        setMessageWithTimeout(`✅ "${trimmedWord}" added! Hindi: ${data.word.translation || data.word.hindiTranslation || 'N/A'}`);
        setCurrentWordData(data.word);
        setWord('');
        setShowSuggestions(false);
        setIsValidWord(true);
        
        // Reload words to update statistics
        loadUserWords(userId);
        } else {
        console.error('API Error:', data);
        setMessageWithTimeout(`❌ Error: ${data.error || 'Failed to add word'}`);
      }
    } catch (error) {
      console.error('Error adding word:', error);
      setMessageWithTimeout('❌ Error: Failed to add word. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    window.location.href = '/login';
  };

  // Original working word change handler
  const handleWordChange = (value: string, event?: React.ChangeEvent<HTMLInputElement>) => {
    setWord(value);

    // Clear suggestions immediately when typing
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Clear current word data when typing new word
    setCurrentWordData(null);

    // Debounce the spelling check
    if (value.length >= 2) {
      setTimeout(() => {
        getSpellingSuggestions(value);
      }, 100); // Reduced timeout for faster response
      } else {
      setIsValidWord(true);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.suggestions-container')) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  if (!mounted) {
  return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="h-6 w-6 text-white" />
      </div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - App-like */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">WordyFy</h1>
              <p className="text-xs text-gray-500">Learn English Words</p>
              </div>
              <button
                onClick={handleLogout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Quick Stats - Enhanced with Quiz Stats */}
        <div className="px-4 py-4">
          {/* Word Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-lg font-semibold text-blue-600">{wordsAddedToday}</div>
              <div className="text-xs text-gray-500">Words Today</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-lg font-semibold text-green-600">{wordsAddedLast7Days}</div>
              <div className="text-xs text-gray-500">This Week</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-lg font-semibold text-purple-600">{storedWords.length}</div>
              <div className="text-xs text-gray-500">Total Words</div>
            </div>
          </div>

          {/* Quiz Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 text-center border border-orange-200">
              <div className="text-lg font-semibold text-orange-600">{quizStats.totalQuizzes}</div>
              <div className="text-xs text-gray-500">Quizzes Taken</div>
              </div>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 text-center border border-emerald-200">
              <div className="text-lg font-semibold text-emerald-600">{Math.round(quizStats.averageAccuracy)}%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-200">
              <div className="text-lg font-semibold text-blue-600">{quizStats.currentStreak}</div>
              <div className="text-xs text-gray-500">Current Streak</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-200">
              <div className="text-lg font-semibold text-purple-600">{quizStats.longestStreak}</div>
              <div className="text-xs text-gray-500">Best Streak</div>
            </div>
          </div>
            </div>

        {/* Add Word Section - Minimal */}
        <div className="px-4 py-2">
          <div className="bg-white rounded-xl p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Add New Word</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => {
                      handleWordChange(e.target.value, e);
                      // Clear message when user starts typing
                      if (message) {
                        setMessage('');
                      }
                    }}
                    onFocus={() => {
                      // Clear message when user focuses on input
                      if (message) {
                          setMessage('');
                        }
                      }}
                      placeholder="Enter a word..."
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                        !isValidWord && showSuggestions ? 'ring-2 ring-red-500' : ''
                      }`}
                    spellCheck={true}
                    autoCorrect="on"
                    autoCapitalize="off"
                    />
                    {!isValidWord && showSuggestions && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                          </div>
                  
                <button
                  type="submit"
                    disabled={loading || !word.trim()}
                    className="px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                      <Plus className="h-4 w-4" />
                )}
                    <span className="hidden sm:inline">Add</span>
              </button>
                          </div>
            
                
                {/* Suggestions Dropdown - Enhanced */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions-container absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-40 overflow-y-auto animate-slideInDown">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-2 py-1 font-medium">Did you mean:</div>
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selectSuggestion(suggestion);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-blue-50 rounded-lg transition-all duration-150 text-sm font-medium text-gray-800 hover:text-blue-700 flex items-center space-x-2 group"
                        >
                          <span className="flex-1">{suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                              </div>
              
              {/* Message Display - Minimal */}
              {message && (
                <div className={`p-3 rounded-xl text-sm ${
                  message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
                  message.includes('ℹ️') ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                  'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-start space-x-2">
                  {message.includes('✅') ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : message.includes('ℹ️') ? (
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    )}
                    <p className="text-sm">{message}</p>
                    </div>
                  </div>
                )}
            </form>
              </div>
            </div>
            
        {/* Word Details - Minimal */}
            {currentWordData && (
          <div className="px-4 py-2">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">
                    {currentWordData.englishWord?.charAt(0).toUpperCase() || currentWordData.word?.charAt(0).toUpperCase()}
                        </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {currentWordData.englishWord?.charAt(0).toUpperCase() + currentWordData.englishWord?.slice(1) || 
                     currentWordData.word?.charAt(0).toUpperCase() + currentWordData.word?.slice(1)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentWordData.translation || currentWordData.hindiTranslation || 'No translation'}
                  </p>
                    </div>
                <div className="flex items-center space-x-1">
                      <button
                        onClick={() => playPronunciation(currentWordData.englishWord || currentWordData.word, false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                    <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

              {/* Meanings - Enhanced */}
                    {currentWordData.meanings && currentWordData.meanings.length > 0 && (
                <div className="space-y-3">
                  {currentWordData.meanings.map((meaning: any, meaningIndex: number) => (
                    <div key={meaningIndex} className="space-y-3">
                      {/* Part of Speech */}
                        <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                                {meaning.partOfSpeech}
                                      </span>
                                    </div>
                      
                      {/* All Definitions */}
                      {meaning.definitions.map((def: any, defIndex: number) => (
                                <div key={defIndex} className="space-y-2">
                          <p className="text-sm text-gray-800 leading-relaxed font-medium">
                            {defIndex + 1}. {def.definition}
                                  </p>
                          
                          {/* Examples */}
                                  {def.example && (
                            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-200">
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700 italic mb-1">
                                    <span className="font-semibold text-gray-600">Example:</span> {def.example}
                                  </p>
                                {def.hindiExample && (
                                    <p className="text-xs text-gray-600 italic">
                                      <span className="font-semibold text-gray-500">Hindi:</span> {def.hindiExample}
                                    </p>
                                )}
                              </div>
                        </div>
                      </div>
                    )}
                                </div>
                              ))}
                      
                      {/* Synonyms and Antonyms - Enhanced */}
                      <div className="space-y-3">
                        {meaning.synonyms && meaning.synonyms.length > 0 && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <h6 className="text-sm font-semibold text-green-700">Synonyms</h6>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {meaning.synonyms.map((synonym: any, synIndex: number) => (
                                <div key={synIndex} className="flex flex-col items-center">
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200 hover:bg-green-200 transition-colors">
                                    {typeof synonym === 'string' ? synonym.charAt(0).toUpperCase() + synonym.slice(1) : synonym.english?.charAt(0).toUpperCase() + synonym.english?.slice(1)}
                          </span>
                                  {(typeof synonym === 'object' && synonym.hindi) && (
                                    <span className="text-xs text-gray-600 mt-1 text-center">
                              {synonym.hindi}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                        
                        {meaning.antonyms && meaning.antonyms.length > 0 && (
                          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-3 border border-red-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <h6 className="text-sm font-semibold text-red-700">Antonyms</h6>
                        </div>
                            <div className="flex flex-wrap gap-2">
                              {meaning.antonyms.map((antonym: any, antIndex: number) => (
                                <div key={antIndex} className="flex flex-col items-center">
                                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200 hover:bg-red-200 transition-colors">
                                    {typeof antonym === 'string' ? antonym.charAt(0).toUpperCase() + antonym.slice(1) : antonym.english?.charAt(0).toUpperCase() + antonym.english?.slice(1)}
                          </span>
                                  {(typeof antonym === 'object' && antonym.hindi) && (
                                    <span className="text-xs text-gray-600 mt-1 text-center">
                              {antonym.hindi}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                      </div>
                  </div>
                  ))}
              </div>
              )}
              </div>
            </div>
          )}

        {/* Quick Actions - App-like */}
        <div className="px-4 py-2">
          <div className="grid grid-cols-3 gap-3">
                <Link
              href="/vault"
              className="bg-white rounded-xl p-4 text-center hover:bg-gray-50 transition-colors"
                >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
        </div>
              <div className="text-sm font-medium text-gray-900">My Words</div>
              <div className="text-xs text-gray-500">{storedWords.length}</div>
            </Link>
            
                <Link
                  href="/quiz"
              className="bg-white rounded-xl p-4 text-center hover:bg-gray-50 transition-colors"
                >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Quiz</div>
              <div className="text-xs text-gray-500">{storedWords.length >= 5 ? 'Ready' : 'Need 5+ words'}</div>
            </Link>
            
                <Link
              href="/sentences"
              className="bg-white rounded-xl p-4 text-center hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
              <div className="text-sm font-medium text-gray-900">Sentences</div>
              <div className="text-xs text-gray-500">Quotes & Text</div>
                </Link>
                  </div>
                </div>
      </main>

      {/* Install Prompt */}
      <InstallPrompt />

      {/* Floating Action Button for Quick Add */}
                      <button
        onClick={() => setShowQuickAddPopup(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      >
        <Plus className="h-6 w-6" />
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Quick Add
                    </div>
      </button>

      {/* Quick Add Popup Modal */}
      {showQuickAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Add Text</h3>
                      <button
                        onClick={() => {
                  setShowQuickAddPopup(false);
                  setQuickAddText('');
                        }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                      <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text
                </label>
                <textarea
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  placeholder="Type anything here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={4}
                  autoFocus
                />
                        </div>
                        
              <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => {
                    setShowQuickAddPopup(false);
                    setQuickAddText('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                          </button>
                <button
                  onClick={handleQuickAdd}
                  disabled={quickAddLoading || !quickAddText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 flex items-center space-x-2"
                >
                  {quickAddLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}