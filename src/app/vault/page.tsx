'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Volume2, ChevronDown, ChevronUp, 
  Calendar, Star, Users, Filter, SortAsc, SortDesc,
  BookOpen, Play, Pause, MoreVertical, Heart, Share
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
  const [wordsPerPage] = useState(12);
  const [expandedWords, setExpandedWords] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'default' | 'a-z' | 'z-a' | 'recent' | 'popular'>('default');
  const [isLoading, setIsLoading] = useState(true);

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
      // If the word is already expanded, collapse it
      newExpanded.delete(wordId);
    } else {
      // If expanding a new word, clear all others first (accordion behavior)
      newExpanded.clear();
      newExpanded.add(wordId);
    }
    setExpandedWords(newExpanded);
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'a-z': return <SortAsc className="h-4 w-4" />;
      case 'z-a': return <SortDesc className="h-4 w-4" />;
      case 'recent': return <Calendar className="h-4 w-4" />;
      case 'popular': return <Users className="h-4 w-4" />;
      default: return <Filter className="h-4 w-4" />;
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="h-6 w-6 text-white" />
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
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="p-2 -ml-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">My Words</h1>
                <p className="text-xs text-gray-500">{words.length} words</p>
              </div>
            </div>
            <button
              onClick={() => {
                const orders = ['default', 'a-z', 'z-a', 'recent', 'popular'] as const;
                const currentIndex = orders.indexOf(sortOrder);
                setSortOrder(orders[(currentIndex + 1) % orders.length]);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {getSortIcon()}
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar - Minimal */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search words..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Words List - Native App Style */}
      {filteredWords.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Words Found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              {searchTerm ? 'Try a different search term.' : 'Start adding words to build your vocabulary!'}
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors"
            >
              Add Words
            </Link>
          </div>
        </div>
      ) : (
        <div className="pb-20">
          {/* Words Grid - Compact */}
          <div className="px-4 py-2">
            {currentWords.map((word, index) => {
              const isExpanded = expandedWords.has(word._id || index.toString());
              const wordId = word._id || index.toString();
              const isAutoWord = (word as any).isRelatedWord === true;
              
              return (
                <div key={wordId} className="mb-2">
                  {/* Main Word Card - Minimal */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Word Avatar - Small */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isAutoWord ? 'bg-orange-100' : 'bg-blue-100'
                        }`}>
                          <span className="text-sm font-semibold text-gray-700">
                            {word.englishWord.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Word Content - Compact */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {word.englishWord.charAt(0).toUpperCase() + word.englishWord.slice(1)}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                              isAutoWord ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {isAutoWord ? 'Auto' : 'User'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {word.translation || word.hindiTranslation || 'No translation'}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {new Date(word.createdAt).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{word.reviewCount}</span>
                            </div>
                            {/* Quiz Stats */}
                            {(word.quizAppearances && word.quizAppearances > 0) && (
                              <>
                                <div className="flex items-center space-x-1">
                                  <div className="h-3 w-3 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-semibold text-blue-600">Q</span>
                                  </div>
                                  <span className="text-xs text-gray-500">{word.quizAppearances}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="h-3 w-3 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-semibold text-green-600">%</span>
                                  </div>
                                  <span className="text-xs text-gray-500">{word.quizAccuracy || 0}%</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions - Minimal */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => playPronunciation(word.englishWord, false)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleWordExpansion(wordId)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded Details - Enhanced */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="space-y-4">
                          {/* All Meanings - Enhanced */}
                          {word.meanings && word.meanings.length > 0 && (
                            <div className="space-y-4">
                              {word.meanings.map((meaning: any, meaningIndex: number) => (
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
                          
                          {/* Pronunciation Details */}
                          {word.phonetics && word.phonetics.length > 0 && (
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <h6 className="text-sm font-semibold text-purple-700">Pronunciation</h6>
                              </div>
                              <div className="space-y-1">
                                {word.phonetics.map((phonetic: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <span className="text-sm text-purple-800 font-mono">{phonetic.text}</span>
                                    {phonetic.audio && (
                                      <button
                                        onClick={() => {
                                          const audio = new Audio(phonetic.audio);
                                          audio.play().catch(() => {});
                                        }}
                                        className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors"
                                      >
                                        <Volume2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
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

          {/* Pagination - Minimal */}
          {totalPages > 1 && (
            <div className="px-4 py-4">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-500">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}