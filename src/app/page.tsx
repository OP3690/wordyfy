'use client';

import { useState } from 'react';
import { 
  Zap, 
  Gamepad2, 
  Trophy, 
  Star, 
  Users, 
  Target, 
  Brain, 
  Sparkles,
  ArrowRight,
  Play,
  BookOpen,
  TrendingUp,
  Award,
  Flame,
  ChevronRight,
  Download,
  Smartphone,
  Volume2,
  Plus,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';

interface WordDetails {
  word: string;
  translation: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  pronunciation: string;
  partOfSpeech: string;
  audioUrl?: string;
}

export default function Home() {
  const [searchWord, setSearchWord] = useState('');
  const [selectedLanguage] = useState('hi'); // Fixed to Hindi only
  const [wordDetails, setWordDetails] = useState<WordDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchWord.trim()) return;

    setLoading(true);
    setError('');
    setWordDetails(null);

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          englishWord: searchWord.trim(),
          fromLanguage: 'en',
          toLanguage: selectedLanguage,
          userId: 'demo-user' // Temporary user for demo
        }),
      });

      const data = await response.json();

      if (response.ok && data.word) {
        setWordDetails({
          word: data.word.englishWord,
          translation: data.word.translation,
          definition: data.word.definition || 'No definition available',
          example: data.word.example || 'No example available',
          synonyms: data.word.synonyms || [],
          antonyms: data.word.antonyms || [],
          pronunciation: data.word.pronunciation || '',
          partOfSpeech: data.word.partOfSpeech || '',
          audioUrl: data.word.audioUrl
        });
      } else {
        setError(data.error || 'Word not found. Please try another word.');
      }
    } catch (error) {
      console.error('Error fetching word details:', error);
      setError('Failed to fetch word details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playPronunciation = (word: string, isHindi: boolean = false) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddToVault = () => {
    // Redirect to signup with the word pre-filled
    const params = new URLSearchParams({
      word: searchWord,
      lang: selectedLanguage,
      source: 'demo'
    });
    window.location.href = `/signup?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">WordyFy</h1>
            </Link>
            <div className="flex space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg text-sm font-semibold"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Learn English Words
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Like Never Before</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Master vocabulary with AI-powered learning, instant translations, and gamified quizzes.
          </p>
        </div>

        {/* Quick Search */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Try It Now</h2>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Enter an English word..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium transition-all placeholder-gray-500"
              autoComplete="off"
              spellCheck="false"
            />
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium flex items-center space-x-2">
              <span className="text-lg">🇮🇳</span>
              <span>Hindi Translation</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Discovering...</span>
                </>
              ) : (
                <>
                  <span>Discover Word</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Word Details */}
          {wordDetails && (
            <div className="mt-6 space-y-4">
              {/* Word Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {wordDetails.word.charAt(0).toUpperCase() + wordDetails.word.slice(1)}
                    </h3>
                    <button
                      onClick={() => playPronunciation(wordDetails.word, false)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                    {wordDetails.partOfSpeech}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-700">{wordDetails.translation}</span>
                  <button
                    onClick={() => playPronunciation(wordDetails.translation, true)}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                </div>
                {wordDetails.pronunciation && (
                  <p className="text-sm text-gray-500 mt-1">{wordDetails.pronunciation}</p>
                )}
              </div>

              {/* Definition */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Definition</h4>
                <p className="text-gray-600 text-sm">{wordDetails.definition}</p>
              </div>

              {/* Example */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Example</h4>
                <p className="text-gray-600 text-sm italic">"{wordDetails.example}"</p>
              </div>

              {/* Synonyms */}
              {wordDetails.synonyms.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-700 mb-2">Synonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {wordDetails.synonyms.slice(0, 5).map((synonym, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                      >
                        {synonym.charAt(0).toUpperCase() + synonym.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Antonyms */}
              {wordDetails.antonyms.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h4 className="text-sm font-semibold text-red-700 mb-2">Antonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {wordDetails.antonyms.slice(0, 5).map((antonym, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full"
                      >
                        {antonym.charAt(0).toUpperCase() + antonym.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Marketing CTA */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-semibold text-gray-700">Word Details Loaded!</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Save this word to your personal vault and track your learning progress
                  </p>
                  <button
                    onClick={handleAddToVault}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Your Vault</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Create a free account to save and track your words
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Smart Learning</h3>
            <p className="text-xs text-gray-600">AI-powered word suggestions</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Gamepad2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Fun Quizzes</h3>
            <p className="text-xs text-gray-600">Gamified learning experience</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Trophy className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Track Progress</h3>
            <p className="text-xs text-gray-600">Monitor your improvement</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Smartphone className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Mobile App</h3>
            <p className="text-xs text-gray-600">Install on your device</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center mb-8 shadow-xl">
          <h2 className="text-xl font-bold mb-2">Ready to Start Learning?</h2>
          <p className="text-blue-100 mb-4 text-sm">Join thousands of learners improving their vocabulary</p>
          <div className="space-y-3">
            <Link
              href="/signup"
              className="block w-full py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="block w-full py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors font-medium"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">10K+</div>
            <div className="text-xs text-gray-600">Words Learned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">5K+</div>
            <div className="text-xs text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">95%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-between w-full py-4 px-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Go to Dashboard</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          
          <Link
            href="/quiz"
            className="flex items-center justify-between w-full py-4 px-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Gamepad2 className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Take a Quiz</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          
          <Link
            href="/vault"
            className="flex items-center justify-between w-full py-4 px-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">View My Vault</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>
      </main>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}