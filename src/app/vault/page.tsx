'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, ArrowLeft, Search, BookOpen, Trophy, Star, Target, 
  ChevronLeft, ChevronRight, Volume2, Play, ChevronDown, 
  ChevronUp, Book, Lightbulb, ChevronsLeft, ChevronsRight,
  Filter, SortAsc, SortDesc, Calendar, Users, TrendingUp,
  Sparkles, Heart, Eye, EyeOff, RefreshCw, Grid, List
} from 'lucide-react';
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
  const [wordsPerPage] = useState(8);
  const [expandedWords, setExpandedWords] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'default' | 'a-z' | 'z-a' | 'recent' | 'popular'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

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
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  const loadUserWords = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/words?userId=${userId}`);
      const data = await response.json();
      
      const sortedWords = (data.words || []).sort((a: Word, b: Word) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setWords(sortedWords);
      setFilteredWords(sortedWords);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading user words:', error);
      const storedWords = getStoredWords();
      const sortedWords = storedWords.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setWords(sortedWords);
      setFilteredWords(sortedWords);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = words;
    
    if (searchTerm) {
      filtered = words.filter(word => 
        word.englishWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (word.translation || word.hindiTranslation || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortOrder === 'default') {
      filtered = [...filtered].sort((a, b) => {
        const aIsAuto = (a as any).isRelatedWord === true;
        const bIsAuto = (b as any).isRelatedWord === true;
        
        if (aIsAuto && !bIsAuto) return 1;
        if (!aIsAuto && bIsAuto) return -1;
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (sortOrder === 'a-z') {
      filtered = [...filtered].sort((a, b) => 
        a.englishWord.toLowerCase().localeCompare(b.englishWord.toLowerCase())
      );
    } else if (sortOrder === 'z-a') {
      filtered = [...filtered].sort((a, b) => 
        b.englishWord.toLowerCase().localeCompare(a.englishWord.toLowerCase())
      );
    } else if (sortOrder === 'recent') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortOrder === 'popular') {
      filtered = [...filtered].sort((a, b) => 
        (b.popularity || 0) - (a.popularity || 0)
      );
    }
    
    setFilteredWords(filtered);
    setCurrentPage(1);
  }, [searchTerm, words, sortOrder]);

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

  const toggleWordExpansion = (wordId: string) => {
    const newExpanded = new Set(expandedWords);
    if (newExpanded.has(wordId)) {
      newExpanded.delete(wordId);
    } else {
      newExpanded.add(wordId);
    }
    setExpandedWords(newExpanded);
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'a-z': return <SortAsc className="h-4 w-4" />;
      case 'z-a': return <SortDesc className="h-4 w-4" />;
      case 'recent': return <Calendar className="h-4 w-4" />;
      case 'popular': return <TrendingUp className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'a-z': return 'A-Z';
      case 'z-a': return 'Z-A';
      case 'recent': return 'Recent';
      case 'popular': return 'Popular';
      default: return 'Default';
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Vault</h2>
          <p className="text-gray-600">Preparing your word collection...</p>
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
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-105 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Word Vault</h1>
                <p className="text-xs text-gray-500">Your Collection</p>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
              <Link
                href="/quiz"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Quiz</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 text-yellow-800" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Word Vault</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            Discover, organize, and master your vocabulary collection
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{words.length}</div>
              <div className="text-sm text-gray-500">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{words.reduce((sum, word) => sum + word.reviewCount, 0)}</div>
              <div className="text-sm text-gray-500">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{words.filter(w => !(w as any).isRelatedWord).length}</div>
              <div className="text-sm text-gray-500">Added by You</div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 mb-8 border border-gray-200/50 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your words..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-500"
              />
            </div>
            
            {/* Controls */}
            <div className="flex gap-3 w-full lg:w-auto">
              {/* Sort */}
              <button
                onClick={() => {
                  const orders = ['default', 'a-z', 'z-a', 'recent', 'popular'] as const;
                  const currentIndex = orders.indexOf(sortOrder);
                  setSortOrder(orders[(currentIndex + 1) % orders.length]);
                }}
                className="flex items-center space-x-2 px-4 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl transition-all font-semibold shadow-sm hover:shadow-md"
              >
                {getSortIcon()}
                <span className="hidden sm:inline">{getSortLabel()}</span>
              </button>
              
              {/* View Mode */}
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl transition-all shadow-sm hover:shadow-md"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </button>
              
              {/* Results Count */}
              {filteredWords.length > 0 && (
                <div className="px-4 py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-semibold flex items-center">
                  {startIndex + 1}-{Math.min(endIndex, filteredWords.length)} of {filteredWords.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Words Collection */}
        {filteredWords.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl border border-gray-200/50">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Words Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm ? 'No words match your search. Try a different term.' : 'Start building your vocabulary by adding new words!'}
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Add Your First Word
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Words Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
              {currentWords.map((word, index) => {
                const isExpanded = expandedWords.has(word._id || index.toString());
                const wordId = word._id || index.toString();
                const isAutoWord = (word as any).isRelatedWord === true;
                
                return (
                  <div key={wordId} className="group">
                    {/* Main Word Card */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Word Avatar */}
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${
                            isAutoWord 
                              ? 'bg-gradient-to-br from-orange-400 to-red-500' 
                              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                          }`}>
                            <span className="text-white font-bold text-xl">
                              {word.englishWord.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          {/* Word Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-2xl font-bold text-gray-900">
                                  {word.englishWord.charAt(0).toUpperCase() + word.englishWord.slice(1)}
                                </h3>
                                
                                {/* Audio Controls */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => playPronunciation(word.englishWord, false)}
                                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors shadow-sm hover:shadow-md"
                                    title="Play English pronunciation"
                                  >
                                    <Volume2 className="h-4 w-4 text-blue-600" />
                                  </button>
                                  
                                  <button
                                    onClick={() => playPronunciation(word.translation || word.hindiTranslation || '', true)}
                                    className="p-2 bg-green-100 hover:bg-green-200 rounded-xl transition-colors shadow-sm hover:shadow-md"
                                    title="Play Hindi pronunciation"
                                  >
                                    <Volume2 className="h-4 w-4 text-green-600" />
                                  </button>
                                </div>
                                
                                {/* Tags */}
                                <div className="flex items-center space-x-2">
                                  {word.partOfSpeech && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
                                      {word.partOfSpeech}
                                    </span>
                                  )}
                                  
                                  <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                                    isAutoWord 
                                      ? 'bg-orange-100 text-orange-700' 
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {isAutoWord ? 'Auto' : 'User'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Stats */}
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>{new Date(word.createdAt).toLocaleDateString('en-GB')}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span>{word.reviewCount}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span>{word.popularity || 1}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Translation */}
                            <div className="mb-4">
                              <p className="text-xl text-gray-700 font-medium">
                                {word.translation || word.hindiTranslation || 'Translation not available'}
                              </p>
                            </div>
                            
                            {/* Pronunciation */}
                            {word.phonetics && word.phonetics.length > 0 && (
                              <div className="flex items-center space-x-2 mb-4">
                                {word.phonetics.slice(0, 2).map((phonetic, phIndex) => (
                                  <div key={phIndex} className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                                      /{phonetic.text}/
                                    </span>
                                    <button
                                      onClick={() => playPronunciation(word.englishWord, false)}
                                      className="p-1 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                                    >
                                      <Volume2 className="h-3 w-3 text-blue-600" />
                                    </button>
                                    {phIndex < (word.phonetics?.slice(0, 2) || []).length - 1 && (
                                      <span className="text-gray-400">|</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Expand Button */}
                        <button
                          onClick={() => toggleWordExpansion(wordId)}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors shadow-sm hover:shadow-md"
                          title={isExpanded ? "Hide details" : "Show details"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="pt-6 border-t border-gray-200">
                          <div className="space-y-6">
                            {/* Definitions */}
                            {word.meanings && word.meanings.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                  <Book className="h-5 w-5 text-indigo-600" />
                                  <span>Detailed Meanings</span>
                                </h4>
                                {word.meanings.slice(0, 2).map((meaning, meaningIndex) => (
                                  <div key={meaningIndex} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4">
                                    <div className="mb-3">
                                      <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-sm font-semibold rounded-lg">
                                        {meaning.partOfSpeech}
                                      </span>
                                    </div>
                                    <div className="space-y-3">
                                      {meaning.definitions.slice(0, 2).map((def, defIndex) => (
                                        <div key={defIndex} className="space-y-2">
                                          <p className="text-gray-800 font-medium leading-relaxed">
                                            {def.definition}
                                          </p>
                                          {def.example && (
                                            <div className="bg-white rounded-xl p-3 space-y-1">
                                              <p className="text-gray-600 italic text-sm">
                                                <span className="font-semibold text-gray-700">Example:</span> {def.example}
                                              </p>
                                              {(def as any).hindiExample && (
                                                <p className="text-gray-500 italic text-sm">
                                                  <span className="font-semibold text-gray-600">Hindi:</span> {(def as any).hindiExample}
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
                                            {meaning.synonyms.slice(0, 3).map((synonym: any, synIndex: number) => (
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
                                            {meaning.antonyms.slice(0, 3).map((antonym: any, antIndex: number) => (
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">First</span>
                </button>

                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  {(() => {
                    const maxVisiblePages = 5;
                    const pages = [];
                    
                    if (totalPages <= maxVisiblePages) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      const currentPageNum = currentPage;
                      const totalPagesNum = totalPages;
                      
                      pages.push(1);
                      
                      if (currentPageNum > 3) {
                        pages.push('...');
                      }
                      
                      const startPage = Math.max(2, currentPageNum - 1);
                      const endPage = Math.min(totalPagesNum - 1, currentPageNum + 1);
                      
                      for (let i = startPage; i <= endPage; i++) {
                        if (i !== 1 && i !== totalPagesNum) {
                          pages.push(i);
                        }
                      }
                      
                      if (currentPageNum < totalPagesNum - 2) {
                        pages.push('...');
                      }
                      
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
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-200'
                              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ));
                  })()}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200"
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