'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Volume2, CheckCircle, AlertCircle, Loader2,
  BookOpen, Trophy, History, LogOut, CalendarDays, TrendingUp,
  Award, Brain, ArrowRight, Star, Users, Target
} from 'lucide-react';
import Link from 'next/link';
import { saveWord, getStoredWords } from '@/lib/storage';
import { Word } from '@/types/word';
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
  const [wordsAddedLast7Days, setWordsAddedLast7Days] = useState(0);
  const [wordsAddedThisMonth, setWordsAddedThisMonth] = useState(0);
  
  // Spelling suggestion states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidWord, setIsValidWord] = useState(true);

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
      setMessageWithTimeout(`ℹ️ "${trimmedWord}" already in your vault! Hindi: ${existingWord.translation || existingWord.hindiTranslation || 'N/A'}`);
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
        setMessageWithTimeout(`✅ "${trimmedWord}" added! Hindi: ${data.word.translation || data.word.hindiTranslation || 'N/A'}`);
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
        {/* Quick Stats - Minimal */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-lg font-semibold text-blue-600">{wordsAddedToday}</div>
              <div className="text-xs text-gray-500">Today</div>
          </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-lg font-semibold text-green-600">{wordsAddedLast7Days}</div>
              <div className="text-xs text-gray-500">This Week</div>
              </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-lg font-semibold text-purple-600">{storedWords.length}</div>
              <div className="text-xs text-gray-500">Total</div>
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
                      onChange={(e) => setWord(e.target.value)}
                      onFocus={() => setMessage('')}
                      placeholder="Enter a word..."
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                        !isValidWord ? 'ring-2 ring-red-500' : ''
                      }`}
                    spellCheck={true}
                    autoCorrect="on"
                    autoCapitalize="off"
                    />
                    {!isValidWord && (
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
            
                {/* Suggestions Dropdown - Minimal */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-32 overflow-y-auto">
                    <div className="p-1">
                      {suggestions.map((suggestion, index) => (
                      <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                        >
                          {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
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

              {/* Meanings - Compact */}
              {currentWordData.meanings && currentWordData.meanings.length > 0 && (
                <div className="space-y-2">
                  {currentWordData.meanings.slice(0, 1).map((meaning: any, meaningIndex: number) => (
                    <div key={meaningIndex} className="space-y-2">
                        <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                                {meaning.partOfSpeech}
                              </span>
                            </div>
                      {meaning.definitions.slice(0, 1).map((def: any, defIndex: number) => (
                        <div key={defIndex} className="space-y-1">
                          <p className="text-sm text-gray-800 leading-relaxed">
                                    {def.definition}
                                  </p>
                                  {def.example && (
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600 italic">
                                <span className="font-medium">Example:</span> {def.example}
                              </p>
                              {def.hindiExample && (
                                <p className="text-xs text-gray-500 italic mt-1">
                                  <span className="font-medium">Hindi:</span> {def.hindiExample}
                                </p>
                              )}
                                    </div>
                                  )}
                                </div>
                              ))}
                      
                      {/* Synonyms and Antonyms - Minimal */}
                      <div className="space-y-2">
                        {meaning.synonyms && meaning.synonyms.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-2">
                            <h6 className="text-xs font-medium text-green-700 mb-1">Synonyms</h6>
                            <div className="flex flex-wrap gap-1">
                              {meaning.synonyms.slice(0, 3).map((synonym: any, synIndex: number) => (
                                <span key={synIndex} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md">
                                  {typeof synonym === 'string' ? synonym.charAt(0).toUpperCase() + synonym.slice(1) : synonym.english?.charAt(0).toUpperCase() + synonym.english?.slice(1)}
                                </span>
                        ))}
                      </div>
                    </div>
                  )}

                        {meaning.antonyms && meaning.antonyms.length > 0 && (
                          <div className="bg-red-50 rounded-lg p-2">
                            <h6 className="text-xs font-medium text-red-700 mb-1">Antonyms</h6>
                            <div className="flex flex-wrap gap-1">
                              {meaning.antonyms.slice(0, 3).map((antonym: any, antIndex: number) => (
                                <span key={antIndex} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md">
                                  {typeof antonym === 'string' ? antonym.charAt(0).toUpperCase() + antonym.slice(1) : antonym.english?.charAt(0).toUpperCase() + antonym.english?.slice(1)}
                          </span>
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
              <div className="text-xs text-gray-500">Test</div>
            </Link>
            
                <Link
              href="/history"
              className="bg-white rounded-xl p-4 text-center hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <History className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">History</div>
              <div className="text-xs text-gray-500">Progress</div>
                </Link>
              </div>
            </div>
      </main>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}