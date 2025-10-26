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
  Flame
} from 'lucide-react';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';

export default function Home() {
  const [searchWord, setSearchWord] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('hi');

  const languages = [
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchWord.trim()) {
      // Redirect to dashboard with search
      window.location.href = `/dashboard?search=${searchWord}&lang=${selectedLanguage}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100/40 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-100/40 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">WordyFy</h1>
            </Link>
            <nav className="flex space-x-6">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                <BookOpen className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/vault"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                <Trophy className="h-5 w-5" />
                <span>My Vault</span>
              </Link>
              <Link
                href="/quiz"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                <Gamepad2 className="h-5 w-5" />
                <span>Play</span>
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-8 shadow-2xl">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Make Words Your
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Superpower</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
            Learn. Translate. Remember. Play.
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Join thousands of learners building their vocabulary with gamified word learning. 
            Every word you learn makes you stronger.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 mb-16 border border-gray-200 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover New Words</h2>
            <p className="text-gray-600 text-lg">Enter an English word to get instant translation and save it to your vault</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Enter an English word..."
                className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 text-xl font-medium transition-all placeholder-gray-500"
                autoComplete="off"
                spellCheck="false"
              />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 text-lg font-medium transition-all"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-white text-gray-900">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 text-lg"
              >
                <Zap className="h-6 w-6" />
                <span>Translate</span>
              </button>
            </div>
          </form>
        </div>

        {/* Game Modes */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 hover:bg-white transition-all group shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Classic Mode</h3>
            <p className="text-gray-700 text-lg text-center mb-6">Learn with your own words in personalized quizzes</p>
            <div className="text-center">
              <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">+5 XP per word</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 hover:bg-white transition-all group shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Advanced Mode</h3>
            <p className="text-gray-700 text-lg text-center mb-6">Play with words from other learners with same language preferences</p>
            <div className="text-center">
              <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">+10 XP per correct</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 hover:bg-white transition-all group shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Champion Mode</h3>
            <p className="text-gray-700 text-lg text-center mb-6">Compete with the most popular words from the community</p>
            <div className="text-center">
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">+15 XP per correct</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 mb-16 border border-gray-200 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Learning Revolution</h2>
            <p className="text-gray-700 text-lg">Thousands of learners are already building their vocabulary</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">10K+</p>
              <p className="text-gray-700">Active Learners</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">50K+</p>
              <p className="text-gray-700">Words Learned</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">95%</p>
              <p className="text-gray-700">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Flame className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">7</p>
              <p className="text-gray-700">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already building their vocabulary with Wordyfy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 text-lg"
            >
              <Sparkles className="h-6 w-6" />
              <span>Start Learning Free</span>
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center space-x-3 text-lg"
            >
              <Play className="h-6 w-6" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </main>
      <InstallPrompt />
    </div>
  );
}