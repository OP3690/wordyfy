'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Zap, Plus, History, Play, LogOut, BookOpen, Users, Trophy, Star, Target, 
  Sparkles, Volume2, Book, CalendarDays, CalendarCheck, Clock, Search,
  TrendingUp, Award, Brain, Lightbulb, ChevronRight, ArrowRight, CheckCircle,
  AlertCircle, Loader2, RefreshCw, Eye, EyeOff, Filter, SortAsc
} from 'lucide-react';
import Link from 'next/link';
import { saveWord, getStoredWords } from '@/lib/storage';
import { Word } from '@/types/word';
import { translateToHindi } from '@/lib/translate';
import InstallPrompt from '@/components/InstallPrompt';

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
  
  // Statistics states
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
    setMessage('');
    setShowPopup(false);
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      setMessageTimeout(null);
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
    }, 10000);
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
    'acheive': ['achieve']
  };

  // Spelling suggestion functions
  const getSpellingSuggestions = async (word: string) => {
    if (!word || word.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidWord(true);
      return;
    }

    const lowerWord = word.toLowerCase();
    
    // Check common misspellings first
    if (commonMisspellings[lowerWord]) {
      setSuggestions(commonMisspellings[lowerWord]);
      setShowSuggestions(true);
      setIsValidWord(false);
      return;
    }

    try {
      const response = await fetch(`https://api.datamuse.com/words?sp=${lowerWord}&max=5`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const suggestions = data.map((item: any) => item.word).filter((suggestion: string) => 
          suggestion.toLowerCase() !== lowerWord
        );
        setSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
        setIsValidWord(suggestions.length === 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsValidWord(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidWord(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setWord(suggestion);
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
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
    
    // Clear message on mount
    setMessage('');
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
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setWordsAddedToday(words.filter((w: Word) => new Date(w.createdAt) >= today).length);
      setWordsAddedYesterday(words.filter((w: Word) => {
        const wordDate = new Date(w.createdAt);
        return wordDate >= yesterday && wordDate < today;
      }).length);
      setWordsAddedLast7Days(words.filter((w: Word) => new Date(w.createdAt) >= last7Days).length);
      setWordsAddedThisMonth(words.filter((w: Word) => new Date(w.createdAt) >= thisMonth).length);
    } catch (error) {
      console.error('Error loading user words:', error);
      const storedWords = getStoredWords();
      setStoredWords(storedWords);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim()) {
      return;
    }

    const trimmedWord = word.trim().toLowerCase();
    
    // Check if word already exists
    const existingWord = storedWords.find(w => 
      w.englishWord.toLowerCase() === trimmedWord
    );
    
    if (existingWord) {
      setMessageWithTimeout(`ℹ️ "${trimmedWord}" (${existingWord.partOfSpeech}) already in your vault! Hindi: ${existingWord.translation || existingWord.hindiTranslation || 'N/A'}`);
      setWord('');
      setShowSuggestions(false);
      setIsValidWord(true);
      return;
    }

    // Check if the word matches any suggestion (direct match)
    if (suggestions.includes(trimmedWord)) {
      setIsValidWord(true);
      setShowSuggestions(false);
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
          word: trimmedWord,
          userId: userId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageWithTimeout(`✅ "${trimmedWord}" added successfully! Hindi: ${data.word.translation || data.word.hindiTranslation || 'N/A'}`);
        setCurrentWordData(data.word);
        setWord('');
        setShowSuggestions(false);
        setIsValidWord(true);
        
        // Reload words to update statistics
        if (userId) {
          loadUserWords(userId);
        }
      } else {
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
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  // Debounced suggestion fetching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSpellingSuggestions(word);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [word]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Preparing your learning experience...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WordyFy</h1>
                <p className="text-xs text-gray-500">Learning Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/vault"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Vault</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 text-yellow-800" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Welcome to Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Learning Dashboard</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            Expand your vocabulary, track your progress, and master new words every day
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{wordsAddedToday}</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{wordsAddedLast7Days}</div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{wordsAddedThisMonth}</div>
                <div className="text-sm text-gray-500">This Month</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{storedWords.length}</div>
                <div className="text-sm text-gray-500">Total Words</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Word Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 mb-8 border border-gray-200/50 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add a New Word</h2>
            <p className="text-gray-600">Discover new vocabulary and expand your knowledge</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    onFocus={() => setMessage('')}
                    placeholder="Enter a word to learn..."
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/30 transition-all text-gray-900 placeholder-gray-500 text-lg ${
                      !isValidWord ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                    }`}
                    spellCheck={true}
                    autoCorrect="on"
                    autoCapitalize="off"
                  />
                  {!isValidWord && (
                    <AlertCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !word.trim()}
                  className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                  <span className="hidden sm:inline">Add Word</span>
                </button>
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between group"
                      >
                        <span className="text-gray-900 font-medium">
                          {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-2xl border-l-4 ${
                message.includes('✅') ? 'bg-green-50 border-green-400 text-green-800' :
                message.includes('ℹ️') ? 'bg-blue-50 border-blue-400 text-blue-800' :
                'bg-red-50 border-red-400 text-red-800'
              }`}>
                <div className="flex items-start space-x-3">
                  {message.includes('✅') ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : message.includes('ℹ️') ? (
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Word Details Section */}
        {currentWordData && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 mb-8 border border-gray-200/50 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Book className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Word Details</h3>
            </div>
            
            <div className="space-y-6">
              {/* Main Word Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {currentWordData.englishWord?.charAt(0).toUpperCase() || currentWordData.word?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentWordData.englishWord?.charAt(0).toUpperCase() + currentWordData.englishWord?.slice(1) || 
                       currentWordData.word?.charAt(0).toUpperCase() + currentWordData.word?.slice(1)}
                    </h4>
                    <p className="text-xl text-gray-700 mb-3">
                      {currentWordData.translation || currentWordData.hindiTranslation || 'Translation not available'}
                    </p>
                    <div className="flex items-center space-x-3">
                      {currentWordData.partOfSpeech && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
                          {currentWordData.partOfSpeech}
                        </span>
                      )}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => playPronunciation(currentWordData.englishWord || currentWordData.word, false)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                          title="Play English pronunciation"
                        >
                          <Volume2 className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => playPronunciation(currentWordData.translation || currentWordData.hindiTranslation || '', true)}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded-xl transition-colors"
                          title="Play Hindi pronunciation"
                        >
                          <Volume2 className="h-4 w-4 text-green-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Meanings */}
              {currentWordData.meanings && currentWordData.meanings.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>Detailed Description & Meanings</span>
                  </h5>
                  {currentWordData.meanings.slice(0, 2).map((meaning: any, meaningIndex: number) => (
                    <div key={meaningIndex} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4">
                      <div className="mb-3">
                        <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-sm font-semibold rounded-lg">
                          {meaning.partOfSpeech}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {meaning.definitions.slice(0, 2).map((def: any, defIndex: number) => (
                          <div key={defIndex} className="space-y-2">
                            <p className="text-gray-800 font-medium leading-relaxed">
                              {def.definition}
                            </p>
                            {def.example && (
                              <div className="bg-white rounded-xl p-3 space-y-1">
                                <p className="text-gray-600 italic text-sm">
                                  <span className="font-semibold text-gray-700">Example:</span> {def.example}
                                </p>
                                {def.hindiExample && (
                                  <p className="text-gray-500 italic text-sm">
                                    <span className="font-semibold text-gray-600">Hindi:</span> {def.hindiExample}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Synonyms and Antonyms */}
                      <div className="mt-4 space-y-3">
                        {meaning.synonyms && meaning.synonyms.length > 0 && (
                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border-l-4 border-emerald-400">
                            <h6 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Synonyms</h6>
                            <div className="flex flex-wrap gap-2">
                              {meaning.synonyms.slice(0, 4).map((synonym: any, synIndex: number) => (
                                <div key={synIndex} className="flex flex-col">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    {typeof synonym === 'string' ? synonym.charAt(0).toUpperCase() + synonym.slice(1) : synonym.english?.charAt(0).toUpperCase() + synonym.english?.slice(1)}
                                  </span>
                                  {typeof synonym === 'object' && synonym.hindi && (
                                    <span className="text-xs text-emerald-600 mt-1 px-2">
                                      {synonym.hindi}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {meaning.antonyms && meaning.antonyms.length > 0 && (
                          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-3 border-l-4 border-red-400">
                            <h6 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Antonyms</h6>
                            <div className="flex flex-wrap gap-2">
                              {meaning.antonyms.slice(0, 4).map((antonym: any, antIndex: number) => (
                                <div key={antIndex} className="flex flex-col">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {typeof antonym === 'string' ? antonym.charAt(0).toUpperCase() + antonym.slice(1) : antonym.english?.charAt(0).toUpperCase() + antonym.english?.slice(1)}
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/vault"
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-105 transition-transform">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Word Vault</h3>
                <p className="text-sm text-gray-600">Browse your collection</p>
              </div>
            </div>
          </Link>
          
          <Link
            href="/quiz"
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-105 transition-transform">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Take Quiz</h3>
                <p className="text-sm text-gray-600">Test your knowledge</p>
              </div>
            </div>
          </Link>
          
          <Link
            href="/history"
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-105 transition-transform">
                <History className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">History</h3>
                <p className="text-sm text-gray-600">View your progress</p>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}