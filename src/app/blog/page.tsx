import Link from 'next/link';
import { blogPosts } from '@/data/blog-posts';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog — Vocabulary Tips, GRE & IELTS Words | WordyFy',
  description: 'Learn how to improve vocabulary, GRE vocabulary words with Hindi meanings, IELTS prep, and daily word habits. WordyFy blog.',
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold">WordyFy</span>
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vocabulary Blog</h1>
        <p className="text-gray-600 mb-8">
          GRE vocabulary words in Hindi, how to improve vocabulary, IELTS tips, and daily learning habits.
        </p>
        <ul className="space-y-6">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  {post.category && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{post.category}</span>}
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-600 text-sm">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-blue-600 text-sm font-medium">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <Link href="/" className="text-blue-600 font-medium hover:underline">Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
