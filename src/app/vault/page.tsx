'use client';

import { useState, useEffect } from 'react';
import { Zap, ArrowLeft, Search, BookOpen, Trophy, Star, Target, ChevronLeft, ChevronRight, Volume2, Play, ChevronDown, ChevronUp, Book, Lightbulb, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { getStoredWords } from '@/lib/storage';
import { Word } from '@/types/word';

export default function VaultPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [wordsPerPage] = useState(10);
  const [expandedWords, setExpandedWords] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'default' | 'a-z' | 'z-a'>('default');

  useEffect(() => {
    setMounted(true);
    
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

  const loadUserWords = async (userId: string) => {
    try {
      console.log('Loading words for userId:', userId);
      const response = await fetch(`/api/words?userId=${userId}`);
      const data = await response.json();
      console.log('API response:', data);
      
      // Sort words by latest first
      const sortedWords = (data.words || []).sort((a: Word, b: Word) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setWords(sortedWords);
      setFilteredWords(sortedWords);
      setCurrentPage(1); // Reset to first page when loading new data
    } catch (error) {
      console.error('Error loading user words:', error);
      // Fallback to localStorage
      const storedWords = getStoredWords();
      const sortedWords = storedWords.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setWords(sortedWords);
      setFilteredWords(sortedWords);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    let filtered = words;
    
    // Apply search filter
    if (searchTerm) {
      filtered = words.filter(word => 
        word.englishWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (word.translation || word.hindiTranslation || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting based on current sort order - REBUILT FROM SCRATCH
    if (sortOrder === 'default') {
      // Default: User-added words first (latest to oldest), then auto-added words
      filtered = [...filtered].sort((a, b) => {
        const aIsAuto = (a as any).isRelatedWord === true;
        const bIsAuto = (b as any).isRelatedWord === true;
        
        // If one is auto and one is user, user comes first
        if (aIsAuto && !bIsAuto) return 1;
        if (!aIsAuto && bIsAuto) return -1;
        
        // If both are same type, sort by date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (sortOrder === 'a-z') {
      // A-Z: Sort alphabetically A to Z
      filtered = [...filtered].sort((a, b) => 
        a.englishWord.toLowerCase().localeCompare(b.englishWord.toLowerCase())
      );
    } else if (sortOrder === 'z-a') {
      // Z-A: Sort alphabetically Z to A
      filtered = [...filtered].sort((a, b) => 
        b.englishWord.toLowerCase().localeCompare(a.englishWord.toLowerCase())
      );
    }
    
    setFilteredWords(filtered);
    setCurrentPage(1); // Reset to first page when search/sort changes
  }, [searchTerm, words, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredWords.length / wordsPerPage);
  const startIndex = (currentPage - 1) * wordsPerPage;
  const endIndex = startIndex + wordsPerPage;
  const currentWords = filteredWords.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const playAudioUrl = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      // Fallback to text-to-speech
      playPronunciation(audioUrl.split('/').pop()?.replace('.mp3', '') || '', false);
    });
  };

  const toggleWordExpansion = (wordId: string) => {
    const newExpanded = new Set(expandedWords);
    if (newExpanded.has(wordId)) {
      newExpanded.delete(wordId);
    } else {
      newExpanded.add(wordId);
    }
    setExpandedWords(newExpanded);
  };

  const handleSortToggle = () => {
    switch (sortOrder) {
      case 'default':
        setSortOrder('z-a'); // First click: Z-A sort
        break;
      case 'z-a':
        setSortOrder('a-z'); // Second click: A-Z sort
        break;
      case 'a-z':
        setSortOrder('default'); // Third click: Default (latest first) sort
        break;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-900 text-xl">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Word Vault</h1>
            </Link>
            <nav className="flex space-x-1 sm:space-x-2">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <Link
                href="/quiz"
                className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-lg sm:rounded-xl hover:from-green-700 hover:to-teal-700 transition-all flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Play Quiz</span>
                <span className="sm:hidden">Quiz</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Word Vault</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
            Discover, organize, and master your vocabulary collection
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{words.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{words.reduce((sum, word) => sum + word.reviewCount, 0)}</div>
              <div className="text-xs sm:text-sm text-gray-500">Reviews</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your words..."
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500 text-base sm:text-lg"
              />
            </div>
            <div className="flex gap-2 sm:gap-4 w-full lg:w-auto">
              <button
                onClick={handleSortToggle}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg sm:rounded-xl transition-all flex items-center justify-center space-x-1 sm:space-x-2 font-semibold shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <span>
                  {sortOrder === 'default' ? 'Default' : 
                   sortOrder === 'a-z' ? 'A-Z' : 'Z-A'}
                </span>
              </button>
              {filteredWords.length > 0 && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-50 text-blue-700 rounded-lg sm:rounded-xl font-semibold flex items-center text-sm sm:text-base">
                  {startIndex + 1}-{Math.min(endIndex, filteredWords.length)} of {filteredWords.length}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Words Collection */}
        {filteredWords.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-12 text-center shadow-xl border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Words Found</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              {searchTerm ? 'No words match your search. Try a different term.' : 'Start building your vocabulary by adding new words!'}
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Add Your First Word
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Words Grid */}
            <div className="grid gap-6">
                  {currentWords.map((word, index) => {
                    const isExpanded = expandedWords.has(word._id || index.toString());
                    const wordId = word._id || index.toString();
                    
                    return (
                      <div key={wordId} className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 group">
                        {/* Main Word Card */}
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                          <div className="flex items-start space-x-3 sm:space-x-6 flex-1">
                            {/* Word Avatar */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                              <span className="text-white font-bold text-2xl sm:text-3xl">
                                {word.englishWord.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {/* Word Content */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="flex items-center space-x-2 sm:space-x-4">
                                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{word.englishWord.charAt(0).toUpperCase() + word.englishWord.slice(1)}</h3>
                                  
                                  {/* Audio Controls */}
                                  <div className="flex items-center space-x-2 sm:space-x-3">
                                    {word.audioUrl ? (
                                      <button
                                        onClick={() => playAudioUrl(word.audioUrl!)}
                                        className="p-3 bg-blue-100 hover:bg-blue-200 rounded-2xl transition-colors shadow-sm hover:shadow-md"
                                        title="Play audio pronunciation"
                                      >
                                        <Play className="h-5 w-5 text-blue-600" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => playPronunciation(word.englishWord, false)}
                                        className="p-3 bg-blue-100 hover:bg-blue-200 rounded-2xl transition-colors shadow-sm hover:shadow-md"
                                        title="Play English pronunciation"
                                      >
                                        <Volume2 className="h-5 w-5 text-blue-600" />
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => playPronunciation(word.translation || word.hindiTranslation || '', true)}
                                      className="p-3 bg-green-100 hover:bg-green-200 rounded-2xl transition-colors shadow-sm hover:shadow-md"
                                      title="Play Hindi pronunciation"
                                    >
                                      <Volume2 className="h-5 w-5 text-green-600" />
                                    </button>
                                  </div>
                                  
                                  {/* Part of Speech */}
                                  {word.partOfSpeech && (
                                    <span className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-xl">
                                      {word.partOfSpeech}
                                    </span>
                                  )}
                                  
                                  {/* Word Source Tag */}
                                  <span className={`px-4 py-2 text-sm font-semibold rounded-xl ${
                                    (word as any).isRelatedWord === true 
                                      ? 'bg-orange-100 text-orange-700' 
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {(word as any).isRelatedWord === true ? 'Auto' : 'User'}
                                  </span>
                                </div>
                                
                                {/* Word Stats - Right Side */}
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-gray-500">📅</span>
                                    <span>Added {new Date(word.createdAt).toLocaleDateString('en-GB')} at {new Date(word.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span>{word.reviewCount} reviews</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Target className="h-4 w-4 text-blue-500" />
                                    <span>{word.popularity || 1} users</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Translation */}
                              <div className="mb-6">
                                <p className="text-2xl text-gray-700 font-medium">
                                  {word.translation || word.hindiTranslation || 'Translation not available'}
                                </p>
                              </div>
                              
                              {/* Pronunciation */}
                              <div className="mb-6">
                                {word.phonetics && word.phonetics.length > 0 ? (
                                  <div className="flex items-center space-x-2">
                                    {word.phonetics.slice(0, 2).map((phonetic, phIndex) => (
                                      <div key={phIndex} className="flex items-center space-x-2">
                                        <span className="text-lg text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                                          /{phonetic.text}/
                                        </span>
                                        <button
                                          onClick={() => {
                                            // Try to play audio from this specific phonetic, fallback to text-to-speech
                                            if (phonetic.audio) {
                                              playAudioUrl(phonetic.audio);
                                            } else {
                                              playPronunciation(word.englishWord, false);
                                            }
                                          }}
                                          className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                                          title={`Play pronunciation: /${phonetic.text}/`}
                                        >
                                          <Volume2 className="h-3 w-3 text-blue-600" />
                                        </button>
                                        {phIndex < (word.phonetics?.slice(0, 2) || []).length - 1 && (
                                          <span className="text-gray-400 mx-1">|</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : word.pronunciation ? (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                                      /{word.pronunciation}/
                                    </span>
                                    <button
                                      onClick={() => playPronunciation(word.englishWord, false)}
                                      className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                                      title="Play pronunciation"
                                    >
                                      <Volume2 className="h-3 w-3 text-blue-600" />
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          
                          {/* Expand Button */}
                          <button
                            onClick={() => toggleWordExpansion(wordId)}
                            className="p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors shadow-sm hover:shadow-md"
                            title={isExpanded ? "Hide details" : "Show details"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-6 w-6 text-gray-600" />
                            ) : (
                              <ChevronDown className="h-6 w-6 text-gray-600" />
                            )}
                          </button>
                        </div>
                        
                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="pt-6 border-t border-gray-200">
                            <div className="space-y-8">
                              {/* Definitions */}
                              {word.meanings && word.meanings.length > 0 && (
                                <div className="space-y-6">
                                  <h4 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                                    <Book className="h-6 w-6 text-blue-600" />
                                    <span>Detailed Description & Meanings</span>
                                  </h4>
                                  {word.meanings.slice(0, 3).map((meaning, meaningIndex) => (
                                    <div key={meaningIndex} className="bg-blue-50 rounded-2xl p-6">
                                      <div className="mb-4">
                                        <span className="px-4 py-2 bg-blue-200 text-blue-800 text-sm font-semibold rounded-xl">
                                          {meaning.partOfSpeech}
                                        </span>
                                      </div>
                                      <div className="space-y-4">
                                        {meaning.definitions.slice(0, 3).map((def, defIndex) => (
                                          <div key={defIndex} className="space-y-3">
                                            <p className="text-gray-800 font-medium leading-relaxed">
                                              {def.definition}
                                            </p>
                                            {def.example && (
                                              <div className="bg-white rounded-xl p-4 space-y-2">
                                                <p className="text-gray-600 italic">
                                                  <span className="font-semibold text-gray-700">Example:</span> {def.example}
                                                </p>
                                                {(def as any).hindiExample && (
                                                  <p className="text-gray-500 italic">
                                                    <span className="font-semibold text-gray-600">Hindi:</span> {(def as any).hindiExample}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {/* Synonyms and Antonyms for this meaning */}
                                      {meaning.synonyms && meaning.synonyms.length > 0 && (
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-l-4 border-green-400">
                                          <h6 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Synonyms</h6>
                                          <div className="flex flex-wrap gap-1">
                                            {meaning.synonyms.slice(0, 4).map((synonym: any, synIndex: number) => (
                                              <div key={synIndex} className="flex flex-col">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                  {typeof synonym === 'string' ? synonym.charAt(0).toUpperCase() + synonym.slice(1) : synonym.english?.charAt(0).toUpperCase() + synonym.english?.slice(1)}
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
                                      
                                      {meaning.antonyms && meaning.antonyms.length > 0 && (
                                        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-3 border-l-4 border-red-400">
                                          <h6 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Antonyms</h6>
                                          <div className="flex flex-wrap gap-1">
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
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-16">
                {/* First Page Button */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">First</span>
                </button>

                {/* Previous Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-2">
                  {(() => {
                    const maxVisiblePages = 10;
                    const pages = [];
                    
                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is <= 10
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Smart pagination with ellipsis
                      const currentPageNum = currentPage;
                      const totalPagesNum = totalPages;
                      
                      // Always show first page
                      pages.push(1);
                      
                      if (currentPageNum > 4) {
                        pages.push('...');
                      }
                      
                      // Show pages around current page
                      const startPage = Math.max(2, currentPageNum - 2);
                      const endPage = Math.min(totalPagesNum - 1, currentPageNum + 2);
                      
                      for (let i = startPage; i <= endPage; i++) {
                        if (i !== 1 && i !== totalPagesNum) {
                          pages.push(i);
                        }
                      }
                      
                      if (currentPageNum < totalPagesNum - 3) {
                        pages.push('...');
                      }
                      
                      // Always show last page
                      if (totalPagesNum > 1) {
                        pages.push(totalPagesNum);
                      }
                    }
                    
                    return pages.map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-3 text-gray-500 font-semibold">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`px-4 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200'
                              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ));
                  })()}
                </div>
                
                {/* Next Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                  title="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Last Page Button */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                  title="Last page"
                >
                  <span className="hidden sm:inline">Last</span>
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}