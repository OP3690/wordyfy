'use client';

import { useCallback } from 'react';

const SHARE_LINKS = (title: string, url: string) => [
  { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, label: 'Share on WhatsApp' },
  { name: 'X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, label: 'Share on X' },
  { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, label: 'Share on LinkedIn' },
];

export default function BlogShareButtons({ title, url }: { title: string; url: string }) {
  const openShare = useCallback((href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="flex gap-2">
      {SHARE_LINKS(title, url).map(({ name, href, label }) => (
        <button
          key={name}
          type="button"
          onClick={() => openShare(href)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors"
          aria-label={label}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
