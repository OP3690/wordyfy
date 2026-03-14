import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllSlugs } from '@/data/blog-posts';
import { BookOpen, Calendar, Share2, Gamepad2 } from 'lucide-react';
import BlogShareButtons from './BlogShareButtons';

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post not found' };
  return {
    title: `${post.title} | WordyFy Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wordyfy.com';
  const url = `${baseUrl}/blog/${post.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: post.author || 'WordyFy' },
    publisher: { '@type': 'Organization', name: 'WordyFy', url: baseUrl },
    url,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gray-900">Blog</Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-[180px]" title={post.title}>{post.title}</span>
          </nav>
        </div>
      </header>
      <article className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          {post.category && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{post.category}</span>}
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-6">{post.excerpt}</p>

        <div
          className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.body.trim() }}
        />

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Share this article</p>
          <BlogShareButtons title={post.title} url={url} />
        </div>

        {post.relatedWords && post.relatedWords.length > 0 && (
          <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Practice these words</h3>
            <p className="text-sm text-gray-600 mb-4">Add them to your vault and take a quiz to remember them.</p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              <Gamepad2 className="h-4 w-4" />
              Take a Quiz
            </Link>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/blog" className="text-blue-600 font-medium hover:underline">← All posts</Link>
          <Link href="/" className="text-blue-600 font-medium hover:underline">Home</Link>
        </div>
      </article>
    </div>
  );
}
