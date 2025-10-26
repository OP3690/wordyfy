'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, MessageSquare, Quote, FileText, StickyNote, 
  Trash2, Calendar, User, Tag, Search, Filter,
  Loader2, AlertCircle, CheckCircle, ArrowLeft,
  Edit3, Save, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Sentence, CreateSentenceRequest } from '@/types/sentence';
import { getUserSession } from '@/lib/auth';

export default function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quickAdding, setQuickAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [quickText, setQuickText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [userId, setUserId] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Edit state
  const [editingSentenceId, setEditingSentenceId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editedType, setEditedType] = useState<'quote' | 'sentence' | 'text' | 'note'>('text');
  const [editedAuthor, setEditedAuthor] = useState('');
  const [editedSource, setEditedSource] = useState('');
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sentenceToDelete, setSentenceToDelete] = useState<Sentence | null>(null);

  const [newSentence, setNewSentence] = useState<CreateSentenceRequest>({
    text: '',
    type: 'sentence',
    author: '',
    source: '',
    tags: []
  });

  useEffect(() => {
    const { userId: storedUserId } = getUserSession();
    if (storedUserId) {
      setUserId(storedUserId);
      loadSentences(storedUserId);
    } else {
      window.location.href = '/login';
    }
  }, []);

  const loadSentences = async (userId: string, page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sentences?userId=${userId}&page=${page}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setSentences(data.sentences || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
      } else {
        setError(data.error || 'Failed to load sentences');
      }
    } catch (error) {
      console.error('Error loading sentences:', error);
      setError('Failed to load sentences');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim() || !userId) return;

    try {
      setQuickAdding(true);
      setError('');
      
      const response = await fetch('/api/sentences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: quickText.trim(),
          type: 'text',
          userId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Quick text added successfully!');
        setQuickText('');
        
        // Add the new sentence to local state immediately
        const newSentenceWithId = {
          ...data.sentence,
          _id: data.sentence._id,
          createdAt: new Date(data.sentence.createdAt),
          updatedAt: new Date(data.sentence.updatedAt)
        };
        setSentences(prevSentences => [newSentenceWithId, ...prevSentences]);
        
        // Also reload from server to ensure consistency
        setTimeout(() => {
          loadSentences(userId);
        }, 100);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to add quick text');
      }
    } catch (error) {
      console.error('Error adding quick text:', error);
      setError('Failed to add quick text');
    } finally {
      setQuickAdding(false);
    }
  };

  const handleAddSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSentence.text.trim() || !userId) return;

    try {
      setAdding(true);
      setError('');
      
      const response = await fetch('/api/sentences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSentence,
          userId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Sentence added successfully!');
        setNewSentence({
          text: '',
          type: 'sentence',
          author: '',
          source: '',
          tags: []
        });
        setShowAddForm(false);
        
        // Add the new sentence to local state immediately
        const newSentenceWithId = {
          ...data.sentence,
          _id: data.sentence._id,
          createdAt: new Date(data.sentence.createdAt),
          updatedAt: new Date(data.sentence.updatedAt)
        };
        setSentences(prevSentences => [newSentenceWithId, ...prevSentences]);
        
        // Also reload from server to ensure consistency
        setTimeout(() => {
          loadSentences(userId);
        }, 100);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to add sentence');
      }
    } catch (error) {
      console.error('Error adding sentence:', error);
      setError('Failed to add sentence');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSentence = async (sentenceId: string) => {
    const sentence = sentences.find(s => s._id === sentenceId);
    if (sentence) {
      setSentenceToDelete(sentence);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!sentenceToDelete) return;

    try {
      const response = await fetch(`/api/sentences?id=${sentenceToDelete._id}&userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Sentence deleted successfully!');
        
        // Remove the sentence from local state immediately
        setSentences(prevSentences => 
          prevSentences.filter(sentence => sentence._id !== sentenceToDelete._id)
        );
        
        // Also reload from server to ensure consistency
        setTimeout(() => {
          loadSentences(userId, currentPage);
        }, 100);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to delete sentence');
      }
    } catch (error) {
      console.error('Error deleting sentence:', error);
      setError('Failed to delete sentence');
    } finally {
      setShowDeleteConfirm(false);
      setSentenceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSentenceToDelete(null);
  };

  const handleEditSentence = (sentence: Sentence) => {
    setEditingSentenceId(sentence._id!);
    setEditedText(sentence.text);
    setEditedType(sentence.type);
    setEditedAuthor(sentence.author || '');
    setEditedSource(sentence.source || '');
  };

  const handleCancelEdit = () => {
    setEditingSentenceId(null);
    setEditedText('');
    setEditedType('text');
    setEditedAuthor('');
    setEditedSource('');
  };

  const handleSaveEdit = async () => {
    if (!editingSentenceId || !editedText.trim() || !userId) return;

    try {
      setEditing(true);
      setError('');
      
      const response = await fetch('/api/sentences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sentenceId: editingSentenceId,
          userId,
          text: editedText.trim(),
          type: editedType,
          author: editedAuthor.trim(),
          source: editedSource.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Sentence updated successfully!');
        
        // Update the sentence in local state immediately
        setSentences(prevSentences => 
          prevSentences.map(sentence => 
            sentence._id === editingSentenceId 
              ? { 
                  ...sentence, 
                  text: editedText.trim(),
                  type: editedType,
                  author: editedAuthor.trim(),
                  source: editedSource.trim(),
                  updatedAt: new Date()
                }
              : sentence
          )
        );
        
        handleCancelEdit();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update sentence');
      }
    } catch (error) {
      console.error('Error updating sentence:', error);
      setError('Failed to update sentence');
    } finally {
      setEditing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote': return <Quote className="h-4 w-4" />;
      case 'sentence': return <MessageSquare className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'note': return <StickyNote className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quote': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'sentence': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'text': return 'bg-green-100 text-green-700 border-green-200';
      case 'note': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredSentences = sentences.filter(sentence => {
    const matchesFilter = filterType === 'all' || sentence.type === filterType;
    return matchesFilter;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadSentences(userId, page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-lg ${
            i === currentPage
              ? 'bg-purple-600 text-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-1 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>
        
        {pages}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading sentences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-3 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="h-6 w-px bg-purple-200"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>My Sentences</span>
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">Store quotes, sentences, and text snippets</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center space-x-1.5 text-sm shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Sentence</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 py-4">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Quick Add Section or Add Sentence Form */}
        {showAddForm ? (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Add New Sentence</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSentence} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text *
                </label>
                <textarea
                  value={newSentence.text}
                  onChange={(e) => setNewSentence({ ...newSentence, text: e.target.value })}
                  placeholder="Enter your sentence, quote, or text..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={newSentence.type}
                    onChange={(e) => setNewSentence({ ...newSentence, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="sentence">Sentence</option>
                    <option value="quote">Quote</option>
                    <option value="text">Text</option>
                    <option value="note">Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={newSentence.author || ''}
                    onChange={(e) => setNewSentence({ ...newSentence, author: e.target.value })}
                    placeholder="Author name (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={newSentence.source || ''}
                  onChange={(e) => setNewSentence({ ...newSentence, source: e.target.value })}
                  placeholder="Book, website, article, etc. (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !newSentence.text.trim()}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 flex items-center space-x-1.5 text-sm"
                >
                  {adding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add Sentence</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                <div className="p-1 bg-purple-100 rounded-md">
                  <Plus className="h-3 w-3 text-purple-600" />
                </div>
                <span>Quick Add</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">Type anything and save it instantly</p>
            </div>
            <form onSubmit={handleQuickAdd} className="flex flex-col gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Type anything here for quick add..."
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                  disabled={quickAdding}
                />
              </div>
              <button
                type="submit"
                disabled={quickAdding || !quickText.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center space-x-1.5 text-sm shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {quickAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Quick Add</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-lg p-3 mb-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-medium text-gray-700">Filter by Type</h3>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-gray-50 focus:bg-white transition-colors"
            >
              <option value="all">All Types</option>
              <option value="quote">Quotes</option>
              <option value="sentence">Sentences</option>
              <option value="text">Text</option>
              <option value="note">Notes</option>
            </select>
          </div>
        </div>


        {/* Sentences List */}
        <div className="space-y-3">
          {filteredSentences.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">No sentences found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {filterType !== 'all' 
                  ? 'Try adjusting your filter criteria or use Quick Add above'
                  : 'Start by typing something in the Quick Add box above, or use the detailed form'
                }
              </p>
              {filterType === 'all' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Quick Add: Type anything and click "Quick Add"</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center space-x-1.5 mx-auto text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Detailed Form</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredSentences.map((sentence) => (
              <div key={sentence._id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-purple-200">
                {editingSentenceId === sentence._id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-gray-900">Edit Sentence</h4>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={handleSaveEdit}
                          disabled={editing || !editedText.trim()}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-1.5 text-sm"
                        >
                          {editing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1.5 text-sm"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          rows={3}
                          placeholder="Enter your text..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                          <select
                            value={editedType}
                            onChange={(e) => setEditedType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="quote">Quote</option>
                            <option value="sentence">Sentence</option>
                            <option value="text">Text</option>
                            <option value="note">Note</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                          <input
                            type="text"
                            value={editedAuthor}
                            onChange={(e) => setEditedAuthor(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Author name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                          <input
                            type="text"
                            value={editedSource}
                            onChange={(e) => setEditedSource(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Source/book name"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 ${getTypeColor(sentence.type)}`}>
                          {getTypeIcon(sentence.type)}
                          <span className="capitalize">{sentence.type}</span>
                        </div>
                        {sentence.author && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                            <User className="h-3 w-3" />
                            <span>{sentence.author}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditSentence(sentence)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSentence(sentence._id!)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-900 mb-3 leading-relaxed text-sm bg-gray-50 p-3 rounded-lg">{sentence.text}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        {sentence.source && (
                          <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
                            <Tag className="h-3 w-3" />
                            <span>{sentence.source}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(sentence.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && sentenceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Sentence</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this sentence? This action cannot be undone.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-800 italic">"{sentenceToDelete.text}"</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
