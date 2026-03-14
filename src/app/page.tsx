'use client';

import { useState } from 'react';
import {
  Zap, Gamepad2, Trophy, Brain, Sparkles, ArrowRight,
  BookOpen, ChevronRight, Smartphone, Volume2, Plus, CheckCircle, XCircle, Loader2, GraduationCap
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

const FAQ_ITEMS = [
  {
    q: 'What is WordyFy?',
    a: 'WordyFy is a vocabulary app that helps you learn English words with Hindi translations, definitions, quizzes, and a personal vault. You can discover words, save them, and take daily quizzes to remember them.',
  },
  {
    q: 'How can I improve my vocabulary for GRE or IELTS?',
    a: 'Add exam-focused words to your vault, use Hindi meanings to reinforce memory, and take the in-app quiz daily. WordyFy supports spaced practice and tracks your streak so you stay consistent.',
  },
  {
    q: 'Is WordyFy free?',
    a: 'Yes. You can sign up for free, add words to your vault, take quizzes, and track your progress. Optional features may be added later.',
  },
  {
    q: 'Can I use WordyFy offline?',
    a: 'When you install WordyFy as an app (PWA), some pages are cached for offline use. Quiz results can sync when you are back online.',
  },
];

const TESTIMONIALS = [
  { quote: 'Finally an app that gives Hindi meanings. Quiz after every word makes it stick.', name: 'Priya M.', role: 'GRE aspirant' },
  { quote: 'Daily streak keeps me coming back. I\'ve learned 200+ words in two months.', name: 'Rahul K.', role: 'IELTS prep' },
  { quote: 'Clean, simple, no ads. Just words and quizzes. Exactly what I needed.', name: 'Anita S.', role: 'Vocabulary builder' },
];

export default function Home() {
  const [searchWord, setSearchWord] = useState('');
  const [selectedLanguage] = useState('hi');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          englishWord: searchWord.trim(),
          fromLanguage: 'en',
          toLanguage: selectedLanguage,
          userId: 'demo-user',
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
          audioUrl: data.word.audioUrl,
        });
      } else {
        setError(data.error || 'Word not found. Try another word.');
      }
    } catch {
      setError('Failed to fetch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playPronunciation = (word: string, isHindi: boolean = false) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = isHindi ? 'hi-IN' : 'en-US';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const handleAddToVault = () => {
    window.location.href = `/signup?${new URLSearchParams({ word: searchWord, lang: selectedLanguage, source: 'demo' }).toString()}`;
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">WordyFy</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link href="/blog" className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100">
                Blog
              </Link>
              <Link href="/login" className="px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium">
                Login
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 font-semibold text-sm shadow-lg">
                Start Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Learn English Words
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">With Hindi Meanings & Quizzes</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Master vocabulary for GRE, IELTS, and daily use. Add words to your vault, take quizzes, and build a streak.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-6 mb-10 shadow-lg border border-gray-100" aria-labelledby="try-now">
          <h2 id="try-now" className="text-lg font-semibold text-gray-900 mb-4 text-center">Try It Now</h2>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Enter an English word..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500"
              autoComplete="off"
              spellCheck="false"
            />
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium flex items-center gap-2">
              <span className="text-lg">🇮🇳</span>
              <span>Hindi Translation</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Discovering...</> : <><span>Discover Word</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {wordDetails && (
            <div className="mt-6 space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{wordDetails.word.charAt(0).toUpperCase() + wordDetails.word.slice(1)}</h3>
                    <button type="button" onClick={() => playPronunciation(wordDetails.word, false)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg">
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">{wordDetails.partOfSpeech}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-700">{wordDetails.translation}</span>
                  <button type="button" onClick={() => playPronunciation(wordDetails.translation, true)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                    <Volume2 className="h-3 w-3" />
                  </button>
                </div>
                {wordDetails.pronunciation && <p className="text-sm text-gray-500 mt-1">{wordDetails.pronunciation}</p>}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Definition</h4>
                <p className="text-gray-600 text-sm">{wordDetails.definition}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Example</h4>
                <p className="text-gray-600 text-sm italic">&quot;{wordDetails.example}&quot;</p>
              </div>
              {wordDetails.synonyms.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-700 mb-2">Synonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {wordDetails.synonyms.slice(0, 5).map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-center gap-2 mb-2"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-sm font-semibold text-gray-700">Save & track this word</span></div>
                <p className="text-xs text-gray-600 mb-3">Add to your vault and quiz yourself later.</p>
                <button type="button" onClick={handleAddToVault} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 font-semibold flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Add to Your Vault
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mb-10" aria-labelledby="exam-prep">
          <h2 id="exam-prep" className="text-xl font-bold text-gray-900 mb-4 text-center">Vocabulary for Exams</h2>
          <p className="text-gray-600 text-center mb-6 max-w-xl mx-auto">Targeted word lists and quizzes for GRE, IELTS, and competitive exams. Learn with Hindi meanings and track your progress.</p>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/blog/gre-vocabulary-words-hindi" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><GraduationCap className="h-5 w-5 text-amber-600" /></div>
              <div>
                <span className="font-semibold text-gray-900 block">GRE Vocabulary</span>
                <span className="text-xs text-gray-500">Hindi meanings & quiz</span>
              </div>
            </Link>
            <Link href="/blog/ielts-vocabulary-hindi" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><BookOpen className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <span className="font-semibold text-gray-900 block">IELTS Vocabulary</span>
                <span className="text-xs text-gray-500">Writing & speaking</span>
              </div>
            </Link>
          </div>
          <div className="mt-4 text-center">
            <Link href="/blog" className="text-blue-600 font-medium text-sm hover:underline">More articles on vocabulary &rarr;</Link>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3"><BookOpen className="h-5 w-5 text-blue-600" /></div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Smart Learning</h3>
            <p className="text-xs text-gray-600">Definitions, Hindi meanings, examples</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3"><Gamepad2 className="h-5 w-5 text-green-600" /></div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Daily Quizzes</h3>
            <p className="text-xs text-gray-600">Quiz your vault, build streaks</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3"><Trophy className="h-5 w-5 text-purple-600" /></div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Track Progress</h3>
            <p className="text-xs text-gray-600">Accuracy, streak, vault size</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3"><Smartphone className="h-5 w-5 text-orange-600" /></div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Install as App</h3>
            <p className="text-xs text-gray-600">PWA, works offline</p>
          </div>
        </section>

        <section className="mb-10" aria-labelledby="stats">
          <h2 id="stats" className="sr-only">Our impact</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-2xl font-bold text-blue-600">10K+</div><div className="text-xs text-gray-600">Words Learned</div></div>
            <div><div className="text-2xl font-bold text-green-600">5K+</div><div className="text-xs text-gray-600">Active Users</div></div>
            <div><div className="text-2xl font-bold text-purple-600">95%</div><div className="text-xs text-gray-600">Success Rate</div></div>
          </div>
        </section>

        <section className="mb-10" aria-labelledby="testimonials">
          <h2 id="testimonials" className="text-xl font-bold text-gray-900 mb-4 text-center">What Learners Say</h2>
          <div className="space-y-4">
            {TESTIMONIALS.map((t, i) => (
              <blockquote key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-gray-700 text-sm mb-2">&quot;{t.quote}&quot;</p>
                <footer className="text-xs text-gray-500"><strong className="text-gray-700">{t.name}</strong> — {t.role}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="mb-10" aria-labelledby="faq">
          <h2 id="faq" className="text-xl font-bold text-gray-900 mb-4 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center mb-10 shadow-xl">
          <h2 className="text-xl font-bold mb-2">Ready to Build Your Vocabulary?</h2>
          <p className="text-blue-100 mb-4 text-sm">Join learners who improve every day with words, quizzes, and streaks.</p>
          <div className="space-y-3">
            <Link href="/signup" className="block w-full py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 font-semibold shadow-lg">
              Create Free Account
            </Link>
            <Link href="/login" className="block w-full py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-medium">
              Already have an account? Login
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <Link href="/dashboard" className="flex items-center justify-between w-full py-4 px-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><BookOpen className="h-4 w-4 text-blue-600" /></div><span className="font-medium text-gray-900">Dashboard</span></div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link href="/quiz" className="flex items-center justify-between w-full py-4 px-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3"><div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><Gamepad2 className="h-4 w-4 text-green-600" /></div><span className="font-medium text-gray-900">Take a Quiz</span></div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link href="/vault" className="flex items-center justify-between w-full py-4 px-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3"><div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><Trophy className="h-4 w-4 text-purple-600" /></div><span className="font-medium text-gray-900">My Vault</span></div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        </section>
      </main>
      <InstallPrompt />
    </div>
  );
}
