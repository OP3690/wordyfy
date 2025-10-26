'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, Plus, History, Play, LogOut, BookOpen, Users, Trophy, Star, Target, Sparkles, Volume2, Book, CalendarDays, CalendarCheck, Clock } from 'lucide-react';
import Link from 'next/link';
import { saveWord, getStoredWords } from '@/lib/storage';
import { Word } from '@/types/word';
import { translateToHindi } from '@/lib/translate';

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
  // New states for statistics
  const [wordsAddedToday, setWordsAddedToday] = useState(0);
  const [wordsAddedYesterday, setWordsAddedYesterday] = useState(0);
  const [wordsAddedLast7Days, setWordsAddedLast7Days] = useState(0);
  const [wordsAddedThisMonth, setWordsAddedThisMonth] = useState(0);
  // Spelling suggestion states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidWord, setIsValidWord] = useState(true);
  const [inputPosition, setInputPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  const clearMessage = () => {
    console.log('🧹 Clearing message');
    setMessage('');
    setShowPopup(false);
    // Don't clear currentWordData immediately - let it persist for user to see
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      setMessageTimeout(null);
    }
  };

  const setMessageWithTimeout = (msg: string) => {
    console.log('🔔 Setting message:', msg);
    clearMessage(); // Clear any existing timeout
    setMessage(msg);
    if ((msg.includes('✅') || msg.includes('ℹ️')) && msg.includes('Hindi:')) {
      setShowPopup(true);
    }
    const timeout = setTimeout(() => {
      setMessage('');
      setShowPopup(false);
      setMessageTimeout(null);
    }, 10000); // 10 seconds
    setMessageTimeout(timeout);
  };

  // Debug current state
  useEffect(() => {
    console.log('🔍 Current state:', {
      word,
      suggestions,
      showSuggestions,
      isValidWord,
      inputPosition
    });
  }, [word, suggestions, showSuggestions, isValidWord, inputPosition]);

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
    'acheive': ['achieve']
  };

  // Spelling suggestion functions
  const getSpellingSuggestions = async (word: string) => {
    console.log('🔍 getSpellingSuggestions called with:', word);
    
    if (!word || word.length < 2) {
      console.log('❌ Word too short, clearing suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidWord(true);
      return;
    }

    const lowerWord = word.toLowerCase();
    
    // Check common misspellings first (instant response)
    if (commonMisspellings[lowerWord]) {
      console.log('📚 Found in common misspellings:', commonMisspellings[lowerWord]);
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

    console.log('✅ Checking spelling for:', word);

    try {
      // Try to get suggestions from Datamuse API
      console.log('🔤 Fetching suggestions from Datamuse...');
      const suggestionsResponse = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(word)}&max=5`);
      
      if (!suggestionsResponse.ok) {
        throw new Error(`Datamuse API error: ${suggestionsResponse.status}`);
      }
      
      const suggestionsData = await suggestionsResponse.json();
      console.log('🔤 Datamuse response:', suggestionsData);
      
      if (suggestionsData && suggestionsData.length > 0) {
        const suggestionWords = suggestionsData.map((item: any) => item.word);
        console.log('🔤 Processed suggestions:', suggestionWords);
        
        setSuggestions(suggestionWords);
        setShowSuggestions(true);
        
        // Check if the current word matches any of the suggestions
        const wordMatchesSuggestion = suggestionWords.some((suggestion: string) => 
          suggestion.toLowerCase() === lowerWord
        );
        
        setIsValidWord(wordMatchesSuggestion);
        console.log('✅ Suggestions set:', suggestionWords.length > 0);
        return;
      }

      // If no suggestions from Datamuse, check dictionary
      console.log('📚 No suggestions found, checking dictionary...');
      const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const isValid = dictResponse.ok;
      setIsValidWord(isValid);
      console.log('📚 Dictionary check result:', isValid);

      if (isValid) {
        console.log('✅ Word is valid, clearing suggestions');
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        console.log('❌ Word not found in dictionary, no suggestions available');
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('❌ Error checking spelling:', error);
      setIsValidWord(true);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

    const handleWordChange = (value: string, event?: React.ChangeEvent<HTMLInputElement>) => {
      console.log('📝 handleWordChange called with:', value);
      setWord(value);

      // Clear suggestions immediately when typing
      setSuggestions([]);
      setShowSuggestions(false);
      
      // Clear current word data when typing new word
      setCurrentWordData(null);

      // Debounce the spelling check
      if (value.length >= 2) {
        console.log('⏰ Setting timeout for spelling check');
        setTimeout(() => {
          console.log('⏰ Timeout triggered, calling getSpellingSuggestions');
          getSpellingSuggestions(value);
        }, 300); // Reduced timeout for faster response
      } else {
        setIsValidWord(true);
      }
    };

  const selectSuggestion = (suggestion: string) => {
    setWord(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsValidWord(true);
  };


  useEffect(() => {
    setMounted(true);
    
    // Clear any existing message on component mount
    setMessage('');
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUser && storedUserId) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setUserId(storedUserId);
        loadUserWords(storedUserId);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data and redirect
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, []);

  // Cleanup effect to clear message on unmount
  useEffect(() => {
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [messageTimeout]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the input container (which includes the dropdown)
      if (!target.closest('.relative')) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [messageTimeout]);

  // Body scroll lock when popup is shown
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]);

  // Debug log for currentWordData
  // useEffect(() => {
  //   if (currentWordData) {
  //     console.log('currentWordData updated:', currentWordData);
  //     console.log('meanings:', currentWordData.meanings);
  //   }
  // }, [currentWordData]);

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPopup) {
        clearMessage();
      }
    };

    if (showPopup) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showPopup]);

  const loadUserWords = async (userId: string) => {
    try {
      const response = await fetch(`/api/words?userId=${userId}`);
      const data = await response.json();
      setStoredWords(data.words || []);
      // Set new stats
      setWordsAddedToday(data.stats?.wordsAddedToday || 0);
      setWordsAddedYesterday(data.stats?.wordsAddedYesterday || 0);
      setWordsAddedLast7Days(data.stats?.wordsAddedLast7Days || 0);
      setWordsAddedThisMonth(data.stats?.wordsAddedThisMonth || 0);
    } catch (error) {
      console.error('Error loading user words:', error);
      // Fallback to localStorage
      setStoredWords(getStoredWords());
      // Reset stats on error
      setWordsAddedToday(0);
      setWordsAddedYesterday(0);
      setWordsAddedLast7Days(0);
      setWordsAddedThisMonth(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      // Don't show error message for empty field - just return silently
      return;
    }
    
    // Frontend validation
    const cleanWord = word.trim().replace(/\s+/g, ' ');
    if (!/^[A-Za-z\s]+$/.test(cleanWord)) {
      setMessage('❌ Please use only letters (A-Z). Numbers and special characters are not allowed.');
      return;
    }
    
    if (cleanWord.length < 2 || cleanWord.length > 50) {
      setMessage('❌ Word must be between 2-50 characters long.');
      return;
    }
    
    if (!userId) {
      setMessage('❌ Please log in to add words');
      window.location.href = '/login';
      return;
    }

    // Check if the current word matches any suggestion (case-insensitive)
    const wordMatchesSuggestion = suggestions.some(suggestion => 
      suggestion.toLowerCase() === cleanWord.toLowerCase()
    );
    
    // If word matches a suggestion, mark it as valid and hide dropdown
    if (wordMatchesSuggestion) {
      setIsValidWord(true);
      setShowSuggestions(false);
    } else if (suggestions.length > 0) {
      // If word doesn't match suggestions and there are suggestions available, 
      // suggest the user to select from dropdown
      setMessage(`💡 Did you mean one of these suggestions? Please select from the dropdown or type a valid word.`);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          englishWord: word,
          userId: userId,
          fromLanguage: user?.fromLanguage || 'en',
          toLanguage: user?.toLanguage || 'hi'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If using fallback storage, save to localStorage
        if (data.fallback) {
          saveWord(data.word);
        }
        
        // console.log('Word data received:', data.word); // Debug log
        // Store the enhanced word data for container display
        setCurrentWordData(data.word);
        
        // Refresh user words
        loadUserWords(userId);
        
        const partOfSpeech = data.word.partOfSpeech ? ` (${data.word.partOfSpeech})` : '';
        
        if (data.success === false && data.message?.includes('already exists')) {
          // Word already exists, show message but keep word details in container
          setMessageWithTimeout(`ℹ️ "${word}"${partOfSpeech} already in your vault! Hindi: ${data.word.translation}`);
        } else {
          // New word added successfully, show message but keep word details in container
          setMessageWithTimeout(`✅ "${word}"${partOfSpeech} added successfully! Hindi: ${data.word.translation}`);
        }
        setWord('');
        
        // Don't show popup - word details will show in container instead
        setShowPopup(false);
      } else {
        // Handle validation errors with specific messages
        if (data.code === 'INVALID_FORMAT') {
          setMessage(`❌ ${data.error}`);
        } else if (data.code === 'INVALID_LENGTH') {
          setMessage(`❌ ${data.error}`);
        } else if (data.code === 'NOT_REAL_WORD') {
          setMessage(`❌ ${data.error}`);
        } else {
          setMessage(`❌ ${data.error || 'Failed to add word'}`);
        }
      }
    } catch (error) {
      console.error('Failed to add word:', error);
      setMessage('❌ Failed to add word. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  const playPronunciation = (word: string, isHindi: boolean = false) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      
      // Set language based on whether it's Hindi or English
      if (isHindi) {
        utterance.lang = 'hi-IN'; // Hindi (India)
      } else {
        utterance.lang = 'en-US'; // English (US)
      }
      
      // Configure for female voice with high clarity
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      utterance.volume = 1.0; // Maximum volume
      
      // Try to find a female voice
      const voices = speechSynthesis.getVoices();
      let femaleVoice;
      
      if (isHindi) {
        // Look for Hindi female voices first, then fallback to any Hindi voice
        femaleVoice = voices.find(voice => 
          voice.lang.startsWith('hi') && 
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('woman') ||
           voice.name.toLowerCase().includes('samantha') ||
           voice.name.toLowerCase().includes('susan') ||
           voice.name.toLowerCase().includes('karen') ||
           voice.name.toLowerCase().includes('victoria') ||
           voice.name.toLowerCase().includes('zira'))
        ) || voices.find(voice => voice.lang.startsWith('hi'));
      } else {
        // Look for English female voices
        femaleVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('woman') ||
           voice.name.toLowerCase().includes('samantha') ||
           voice.name.toLowerCase().includes('susan') ||
           voice.name.toLowerCase().includes('karen') ||
           voice.name.toLowerCase().includes('victoria') ||
           voice.name.toLowerCase().includes('zira'))
        );
      }
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" style={{ isolation: 'isolate' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wordyfy</h1>
            </Link>
            <nav className="flex space-x-1 sm:space-x-2">
              <Link
                href="/vault"
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm sm:text-base"
              >
                <History className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">My Vault</span>
                <span className="sm:hidden">Vault</span>
              </Link>
              <Link
                href="/quiz"
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm sm:text-base"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Play</span>
                <span className="sm:hidden">Quiz</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm sm:text-base"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
              Welcome to Your <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Learning Dashboard
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Build your vocabulary, track your progress, and master new words with our intelligent learning platform
            </p>
          </div>

          {/* Add Word Section */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-24 sm:mb-36 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 relative z-10">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-xl transform hover:scale-105 transition-transform duration-300">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Add a New Word</h2>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Enter an English word to get comprehensive details and expand your vocabulary
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-20 sm:pb-28">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-4xl mx-auto">
                <div className="flex-1 relative z-20">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => {
                      handleWordChange(e.target.value, e);
                      // Clear message when user starts typing
                      if (message) {
                        clearMessage();
                      }
                    }}
                    onFocus={() => {
                      // Clear message when user focuses on input
                      if (message) {
                        clearMessage();
                      }
                    }}
                    placeholder="Enter an English word..."
                    className={`flex-1 w-full px-4 sm:px-6 md:px-8 py-3 sm:py-5 md:py-6 bg-white/95 border-2 rounded-xl sm:rounded-2xl md:rounded-3xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 text-base sm:text-lg md:text-xl font-medium transition-all placeholder-gray-500 shadow-lg hover:shadow-xl backdrop-blur-sm ${
                      !isValidWord && word.length > 2 ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-gray-200'
                    }`}
                    autoComplete="off"
                    spellCheck={true}
                    autoCorrect="on"
                    autoCapitalize="off"
                    lang="en"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                  />
                
                  {/* Visual indicator for misspelled words */}
                  {!isValidWord && word.length > 2 && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {/* Simple dropdown that stays within container */}
                  {mounted && showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl border-2 border-emerald-400/70 rounded-2xl shadow-2xl max-h-56 overflow-hidden z-50">
                      <div className="p-4 border-b border-emerald-200/60 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 backdrop-blur-sm">
                        <p className="text-sm text-emerald-800 font-bold flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                          <span>Did you mean:</span>
                        </p>
                      </div>
                      <div className="p-1 bg-white/95 backdrop-blur-sm max-h-44 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all duration-200 flex items-center justify-between group border border-transparent hover:border-emerald-300/50 hover:shadow-sm hover:scale-[1.02] hover:translate-x-1"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                              <span className="text-gray-800 font-semibold text-lg group-hover:text-emerald-800 transition-colors">{suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}</span>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <span className="text-xs text-emerald-600 font-medium">Click to use</span>
                              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                                <Plus className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-2 bg-gradient-to-r from-gray-50/90 to-emerald-50/90 border-t border-gray-200/60">
                        <p className="text-xs text-gray-500 text-center font-medium">
                          💡 Click any suggestion to use it
                        </p>
                      </div>
                    </div>
                  )}
                
                {/* Enhanced Invalid word indicator */}
                {!isValidWord && word.length > 2 && !showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-[9999]">
                    <div className="bg-red-50/95 backdrop-blur-md border-2 border-red-400/60 rounded-xl px-4 py-3 flex items-center space-x-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
                      <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-red-800 text-sm font-bold">Word not found in dictionary</span>
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl sm:rounded-2xl md:rounded-3xl hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4 text-base sm:text-lg md:text-xl disabled:opacity-50 sm:min-w-[200px] md:min-w-[220px]"
                >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
                    <span>Add Word</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Word Details Section */}
            {currentWordData && (
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 rounded-2xl border border-emerald-200/60 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">Word Details</h3>
                  <p className="text-sm text-emerald-600">Here's what you just added to your vault</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Section */}
                  <div className="bg-white/80 rounded-xl p-4 border border-emerald-200/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">English</span>
                      <button
                        onClick={() => playPronunciation(currentWordData.englishWord || currentWordData.word, false)}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-full transition-colors"
                        title="Play pronunciation"
                      >
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.816a1 1 0 011-.108zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800">{(currentWordData.englishWord || currentWordData.word)?.charAt(0).toUpperCase() + (currentWordData.englishWord || currentWordData.word)?.slice(1)}</h4>
                    {currentWordData.partOfSpeech && (
                      <p className="text-sm text-gray-600 mt-1 italic">({currentWordData.partOfSpeech})</p>
                    )}
                    {currentWordData.pronunciation && (
                      <p className="text-sm text-gray-500 mt-1 font-mono">/{currentWordData.pronunciation}/</p>
                    )}
                  </div>

                  {/* Hindi Section */}
                  <div className="bg-white/80 rounded-xl p-4 border border-emerald-200/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Hindi</span>
                      <button
                        onClick={() => playPronunciation(currentWordData.translation, true)}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-full transition-colors"
                        title="Play pronunciation"
                      >
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.816a1 1 0 011-.108zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800">{currentWordData.translation}</h4>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-6 p-4 bg-white/60 rounded-xl border border-emerald-200/40">
                  <h5 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-4">Detailed Description & Meanings</h5>
                  <div className="space-y-3">
                    {/* Show meanings array if available */}
                    {currentWordData.meanings && currentWordData.meanings.length > 0 && (
                      <>
                        {currentWordData.meanings.slice(0, 1).map((meaning: any, index: number) => (
                          <div key={index} className="space-y-2">
                            {meaning.definitions && meaning.definitions.length > 0 && (
                              <>
                                {meaning.definitions.slice(0, 3).map((def: any, defIndex: number) => (
                                  <div key={defIndex} className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border-l-4 border-emerald-400">
                                    <div className="flex items-start space-x-2">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        {meaning.partOfSpeech} {defIndex + 1}
                                      </span>
                                      <p className="text-sm text-gray-800 leading-relaxed">{def.definition}</p>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                    
                    {/* Show examples in a better format - only from definitions array */}
                    {currentWordData.meanings && currentWordData.meanings[0] && currentWordData.meanings[0].definitions && (
                      <div className="mt-4">
                        <h6 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Examples</h6>
                        <div className="space-y-2">
                          {currentWordData.meanings[0].definitions.slice(0, 3).map((def: any, index: number) => (
                            def.example && (
                              <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border-l-4 border-purple-400">
                                <p className="text-sm text-gray-700 italic mb-2">"{def.example}"</p>
                                {def.hindiExample && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600 font-medium">Hindi: {def.hindiExample}</p>
                                  </div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Show synonyms and antonyms in a better format */}
                    {(currentWordData.meanings && currentWordData.meanings[0] && (currentWordData.meanings[0].synonyms?.length > 0 || currentWordData.meanings[0].antonyms?.length > 0)) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentWordData.meanings[0].synonyms && currentWordData.meanings[0].synonyms.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-l-4 border-green-400">
                    <h6 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Synonyms</h6>
                    <div className="flex flex-wrap gap-1">
                      {currentWordData.meanings[0].synonyms.slice(0, 3).map((synonym: any, index: number) => (
                        <div key={index} className="flex flex-col">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {typeof synonym === 'string' ? synonym.charAt(0).toUpperCase() + synonym.slice(1) : synonym.english}
                          </span>
                          {typeof synonym === 'object' && synonym.hindi && (
                            <span className="text-xs text-green-600 mt-1 px-2">
                              {synonym.hindi}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                        
                {currentWordData.meanings[0].antonyms && currentWordData.meanings[0].antonyms.length > 0 && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-3 border-l-4 border-red-400">
                    <h6 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Antonyms</h6>
                    <div className="flex flex-wrap gap-1">
                      {currentWordData.meanings[0].antonyms.slice(0, 3).map((antonym: any, index: number) => (
                        <div key={index} className="flex flex-col">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {typeof antonym === 'string' ? antonym.charAt(0).toUpperCase() + antonym.slice(1) : antonym.english}
                          </span>
                          {typeof antonym === 'object' && antonym.hindi && (
                            <span className="text-xs text-red-600 mt-1 px-2">
                              {antonym.hindi}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Spacer to prevent dropdown overlap */}
          <div className="h-28"></div>

          {/* Message Display between form and Word Details */}
          {message && !showPopup && (
            <div className={`mt-6 mb-6 p-6 rounded-2xl border transition-all duration-300 transform ${
              message.includes('✅') 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 shadow-sm' 
                : message.includes('❌')
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800 shadow-sm'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800 shadow-sm'
            }`}>
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.includes('✅') 
                    ? 'bg-green-100' 
                    : message.includes('❌')
                    ? 'bg-red-100'
                    : 'bg-blue-100'
                }`}>
                  {message.includes('✅') ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : message.includes('❌') ? (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold leading-relaxed">{message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Popup Modal - Disabled to show word details in container instead */}
        {false && showPopup && (message.includes('✅') || message.includes('ℹ️')) && message.includes('Hindi:') && (
          <div 
            className="popup-overlay flex items-center justify-center p-4"
            onClick={clearMessage}
          >
            <div 
              className="popup-content bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Word Added!</h3>
                    <p className="text-sm text-gray-500">Successfully saved to your vault</p>
                  </div>
                </div>
                <button
                  onClick={clearMessage}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* English Word */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">English</span>
                        <span className="text-lg font-bold text-gray-900">
                          {currentWordData?.englishWord || message.match(/"([^"]+)"/)?.[1] || 'Word'}
                        </span>
                        {currentWordData?.partOfSpeech && (
                          <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                            {currentWordData.partOfSpeech}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const englishWord = currentWordData?.englishWord || message.match(/"([^"]+)"/)?.[1];
                          if (englishWord) playPronunciation(englishWord, false);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                        title="Play pronunciation"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Hindi Translation */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Hindi</span>
                        <span className="text-lg font-bold text-gray-900">
                          {currentWordData?.translation || message.match(/Hindi: ([^!]+)/)?.[1]?.trim() || 'Translation'}
                        </span>
                        {currentWordData?.translationSource && (
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            {currentWordData.translationSource}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const hindiTranslation = currentWordData?.translation || message.match(/Hindi: ([^!]+)/)?.[1];
                          if (hindiTranslation) playPronunciation(hindiTranslation.trim(), true);
                        }}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors"
                        title="Play pronunciation"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Alternative Translations */}
                    {currentWordData?.alternativeTranslations && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Alternative Translations:</div>
                        <div className="space-y-1">
                          {currentWordData.alternativeTranslations.google && currentWordData.alternativeTranslations.google !== currentWordData.translation && (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-500">Google:</span>
                              <span className="text-gray-700">{currentWordData.alternativeTranslations.google}</span>
                            </div>
                          )}
                          {currentWordData.alternativeTranslations.libre && currentWordData.alternativeTranslations.libre !== currentWordData.translation && (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-500">Libre:</span>
                              <span className="text-gray-700">{currentWordData.alternativeTranslations.libre}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Definitions Section - Highlighted */}
                  {currentWordData?.meanings && currentWordData.meanings.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Book className="h-5 w-5 text-blue-600" />
                          <span className="text-lg font-bold text-blue-800">Definitions</span>
                        </div>
                        
                        {currentWordData.meanings.slice(0, 3).map((meaning: any, meaningIndex: number) => (
                          <div key={meaningIndex} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                            <div className="mb-4">
                              <span className="text-lg font-bold text-gray-800 capitalize">
                                {meaning.partOfSpeech}
                              </span>
                            </div>
                            <div className="space-y-4">
                              {meaning.definitions.slice(0, 3).map((def: any, defIndex: number) => (
                                <div key={defIndex} className="space-y-2">
                                  <p className="text-gray-800 font-medium leading-relaxed">
                                    {def.definition}
                                  </p>
                                  {def.example && (
                                    <div className="ml-4">
                                      <p className="text-sm text-gray-600 font-medium">Example:</p>
                                      <p className="text-sm text-gray-700 italic">
                                        {def.example}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pronunciation */}
                  {currentWordData?.pronunciation && (
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pronunciation</span>
                          <span className="text-sm font-mono text-gray-800">
                            /{currentWordData.pronunciation}/
                          </span>
                        </div>
                        {currentWordData.audioUrl && (
                          <button
                            onClick={() => {
                              const audio = new Audio(currentWordData.audioUrl);
                              audio.play().catch(error => {
                                console.error('Error playing audio:', error);
                                playPronunciation(currentWordData.englishWord, false);
                              });
                            }}
                            className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors"
                            title="Play audio pronunciation"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">🎉 Great job! Keep building your vocabulary</p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <span>✓ Saved to vault</span>
                    <span>•</span>
                    <span>📚 Continue learning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Statistics Section */}
          <div className="mb-16 relative z-10 mt-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Your Learning Progress</h2>
              <p className="text-gray-600 text-base sm:text-lg">Track your vocabulary growth and achievements</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 transform">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Added Today</h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {mounted ? wordsAddedToday : 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">New words today</p>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Added Yesterday</h3>
                <p className="text-3xl font-bold text-orange-500 mb-1">
                  {mounted ? wordsAddedYesterday : 0}
                </p>
                <p className="text-sm text-gray-500">Words from yesterday</p>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <CalendarDays className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Last 7 Days</h3>
                <p className="text-3xl font-bold text-cyan-600 mb-1">
                  {mounted ? wordsAddedLast7Days : 0}
                </p>
                <p className="text-sm text-gray-500">Weekly progress</p>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <CalendarDays className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">This Month</h3>
                <p className="text-3xl font-bold text-emerald-600 mb-1">
                  {mounted ? wordsAddedThisMonth : 0}
                </p>
                <p className="text-sm text-gray-500">Monthly achievement</p>
              </div>
            </div>
          </div>

          {/* Game Modes Section */}
          <div className="mb-16 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Learning Activities</h2>
              <p className="text-gray-600 text-lg">Choose your preferred way to learn and practice</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 text-center transform">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Classic Quiz</h3>
                <p className="text-gray-600 text-lg mb-8">Test your knowledge with your own saved words</p>
                <Link
                  href="/quiz"
                  className="inline-block w-full px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-xl text-lg"
                >
                  Play Now
                </Link>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 text-center transform">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Game</h3>
                <p className="text-gray-600 text-lg mb-8">Challenge yourself with community-curated words</p>
                <Link
                  href="/advanced-game"
                  className="inline-block w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl text-lg"
                >
                  Play Now
                </Link>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 text-center transform">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Word Vault</h3>
                <p className="text-gray-600 text-lg mb-8">Review and manage your personal word collection</p>
                <Link
                  href="/vault"
                  className="inline-block w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-xl text-lg"
                >
                  View Vault
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}