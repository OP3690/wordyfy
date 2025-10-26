'use client';

import { Volume2, BookOpen, X, Trophy } from 'lucide-react';
import { Word } from '@/types/word';

interface WordDetailsProps {
  word: Word;
  onClose?: () => void;
}

export default function WordDetails({ word, onClose }: WordDetailsProps) {
  const playPronunciation = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.englishWord);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white relative">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {/* Word Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-4xl font-bold capitalize tracking-tight">{word.englishWord}</h2>
            <button
              onClick={playPronunciation}
              className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 backdrop-blur-sm hover:scale-105"
              title="Play pronunciation"
            >
              <Volume2 className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Word Details */}
        <div className="flex items-center space-x-6 mb-8">
          {word.pronunciation && (
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-lg font-mono font-semibold">{word.pronunciation}</span>
            </div>
          )}
          {word.partOfSpeech && (
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-lg font-semibold capitalize">{word.partOfSpeech}</span>
            </div>
          )}
        </div>
        
        {/* Translation Section */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">Translation</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-3xl font-bold text-center tracking-wide">
              {word.translation || word.hindiTranslation || 'Translation not available'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Learning Progress */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Learning Progress</h3>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2 font-medium">Reviews</p>
              <p className="text-2xl font-bold text-blue-600">{word.reviewCount}</p>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2 font-medium">Added</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(word.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2 font-medium">Last Review</p>
              <p className="text-sm font-semibold text-gray-800">
                {word.lastReviewed 
                  ? new Date(word.lastReviewed).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}