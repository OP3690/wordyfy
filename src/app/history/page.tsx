'use client';

import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Calendar, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';
import { Word } from '@/types/word';
import { getStoredWords } from '@/lib/storage';
import WordDetails from '@/components/WordDetails';

export default function HistoryPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const response = await fetch('/api/words');
      const data = await response.json();
      
      // If no words from MongoDB, try localStorage
      if (data.words && data.words.length > 0) {
        setWords(data.words);
      } else {
        const storedWords = getStoredWords();
        setWords(storedWords);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      // Fallback to localStorage
      const storedWords = getStoredWords();
      setWords(storedWords);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your words...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">Word History</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {words.length} words learned
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {words.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Words Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start learning by adding your first English word on the home page.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Your First Word
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Words</p>
                    <p className="text-2xl font-bold text-gray-900">{words.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {words.reduce((sum, word) => sum + word.reviewCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Latest Addition</p>
                    <p className="text-sm font-bold text-gray-900">
                      {words.length > 0 ? formatDate(words[0].createdAt.toString()) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Words List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Your Word Collection</h2>
                <p className="text-gray-600">All the words you've learned and their Hindi translations</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {words.map((word, index) => (
                  <div key={word._id || index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 capitalize">
                            {word.englishWord}
                          </h3>
                          <span className="text-lg text-indigo-600 font-medium">
                            {word.hindiTranslation}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Added: {formatDate(word.createdAt.toString())}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>Reviews: {word.reviewCount}</span>
                          </div>
                          {word.lastReviewed && (
                            <div className="flex items-center space-x-1">
                              <span>Last reviewed: {formatDate(word.lastReviewed.toString())}</span>
                            </div>
                          )}
                        </div>
                        {/* Additional word details preview */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {word.partOfSpeech && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {word.partOfSpeech}
                            </span>
                          )}
                          {word.pronunciation && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-mono">
                              {word.pronunciation}
                            </span>
                          )}
                          {word.meanings?.[0]?.synonyms && word.meanings[0].synonyms.length > 0 && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {word.meanings[0].synonyms.length} synonyms
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4">
                        <button
                          onClick={() => setSelectedWord(word)}
                          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Word Details Modal */}
        {selectedWord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <WordDetails 
                word={selectedWord} 
                onClose={() => setSelectedWord(null)} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
