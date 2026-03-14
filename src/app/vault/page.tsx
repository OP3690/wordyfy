'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Calendar, Users, Filter, SortAsc, SortDesc, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getUserSession, restoreSession } from '@/lib/auth';
import { Word } from '@/types/word';
import { useSRS } from '@/lib/useSRS';
import VaultCard from '@/components/VaultCard';

function wordToVaultData(w: Word): { id: string; word: string; meaning: string; hindi: string; partOfSpeech: string } {
  const id = w._id ? String(w._id) : '';
  const meaning =
    (w.meanings?.[0]?.definitions?.[0]?.definition as string) ||
    (w as unknown as { definition?: string }).definition ||
    'No definition';
  return {
    id,
    word: w.englishWord.charAt(0).toUpperCase() + w.englishWord.slice(1),
    meaning,
    hindi: w.translation || (w as Word & { hindiTranslation?: string }).hindiTranslation || '—',
    partOfSpeech: w.partOfSpeech || w.meanings?.[0]?.partOfSpeech || 'noun',
  };
}

export default function VaultPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [wordsPerPage] = useState(12);
  const [sortOrder, setSortOrder] = useState<'default' | 'a-z' | 'z-a' | 'recent' | 'popular'>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [srsFilter, setSrsFilter] = useState<'all' | 'due' | 'learning' | 'mastered'>('all');
  const srs = useSRS();

  useEffect(() => {
    setMounted(true);
    
    // Try to restore session first (for mobile app reopening)
    const sessionRestored = restoreSession();
    
    // Use persistent login system
    const { user: userData, userId: storedUserId, rememberMe } = getUserSession();
    
    if (userData && storedUserId) {
      console.log('🔐 User session found:', rememberMe ? 'persistent' : 'session');
      setUser(userData);
      setUserId(storedUserId);
      loadUserWords(storedUserId);
    } else {
      console.log('🔐 No valid session found, redirecting to login');
      // No valid session found, redirect to login
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
      setWords([]);
      setFilteredWords([]);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let filtered = words;

    if (searchTerm) {
      filtered = words.filter(word =>
        word.englishWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (word.translation || (word as Word & { hindiTranslation?: string }).hindiTranslation || '').toLowerCase().includes(searchTerm.toLowerCase())
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

    if (srsFilter !== 'all' && today) {
      filtered = filtered.filter((word) => {
        const wordId = word._id ? String(word._id) : '';
        const card = srs.getCard(wordId);
        if (!card) return false;
        if (srsFilter === 'due') return card.dueDate <= today;
        if (srsFilter === 'learning') return card.repetitions < 7;
        if (srsFilter === 'mastered') return card.repetitions >= 7;
        return true;
      });
    }

    setFilteredWords(filtered);
    setCurrentPage(1);
  }, [searchTerm, words, sortOrder, srsFilter, srs.cards]);

  const totalPages = Math.ceil(filteredWords.length / wordsPerPage);
  const startIndex = (currentPage - 1) * wordsPerPage;
  const endIndex = startIndex + wordsPerPage;
  const currentWords = filteredWords.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* SRS stats row */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            ['Due today', srs.dueCount, srs.dueCount > 0 ? '#6C47FF' : undefined],
            ['In SRS', srs.totalCards, undefined],
            ['Mastered', srs.masteredCards.length, '#10b981'],
            ['Next 7d', srs.upcoming.reduce((s, u) => s + u.count, 0), undefined],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="bg-gray-50 rounded-lg py-2.5 px-3">
              <div className="text-lg font-medium" style={color ? { color } : undefined}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        {srs.dueCount > 0 && (
          <Link
            href="/vault/review"
            className="flex items-center justify-between w-full px-4 py-3 bg-[#6C47FF] text-white rounded-xl font-medium no-underline hover:opacity-95 transition-opacity"
          >
            <div>
              <span className="text-sm font-semibold">Start today&apos;s review</span>
              <p className="text-xs text-white/80">{srs.dueCount} word{srs.dueCount !== 1 ? 's' : ''} due</p>
            </div>
            <span className="text-xl">→</span>
          </Link>
        )}
        <div className="flex gap-1 mt-3 p-1 bg-gray-100 rounded-lg">
          {(['all', 'due', 'learning', 'mastered'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSrsFilter(f)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                srsFilter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Words List - VaultCard SRS (spec) */}
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
          {/* SRS Vault cards (spec) */}
          <div className="px-4 py-2 flex flex-col gap-3">
            {currentWords.map((word) => {
              const wordId = word._id ? String(word._id) : '';
              if (!wordId) return null;
              return (
                <VaultCard
                  key={wordId}
                  word={wordToVaultData(word)}
                  card={srs.getCard(wordId)}
                  onAdd={srs.addWord}
                  onRemove={srs.removeWord}
                  onReview={(id) => {
                    window.location.href = `/vault/review?word=${id}`;
                  }}
                />
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