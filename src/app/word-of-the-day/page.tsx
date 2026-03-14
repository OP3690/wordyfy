import { Metadata } from "next";
import Link from "next/link";

const APP_URL = "https://www.wordyfy.com";

async function getTodaysWord() {
  return {
    word: "ephemeral",
    meaning: "Lasting for a very short time; transitory",
    hindi: "क्षणभंगुर",
    partOfSpeech: "adjective",
    example: "The ephemeral beauty of cherry blossoms reminds us to cherish fleeting moments.",
    funFact: "Social media posts are the most ephemeral form of modern communication — here today, forgotten tomorrow.",
    date: new Date().toISOString(),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const word = await getTodaysWord();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const ogUrl = `${APP_URL}/api/og?type=word&word=${encodeURIComponent(word.word)}&meaning=${encodeURIComponent(word.meaning)}&hindi=${encodeURIComponent(word.hindi)}`;

  return {
    title: `Word of the Day: ${word.word} — ${today} | WordyFy`,
    description: `Today's word: "${word.word}" — ${word.meaning}. Hindi: ${word.hindi}. Learn one powerful English word every day with WordyFy.`,
    openGraph: {
      title: `Word of the Day: ${word.word}`,
      description: `${word.meaning} | Hindi: ${word.hindi}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Word of the Day: ${word.word}`,
      description: `${word.meaning} | Hindi: ${word.hindi}`,
      images: [ogUrl],
    },
    alternates: { canonical: `${APP_URL}/word-of-the-day` },
  };
}

export default async function WordOfTheDayPage() {
  const word = await getTodaysWord();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Word of the Day: ${word.word} — ${today}`,
    description: `${word.word}: ${word.meaning}`,
    datePublished: word.date,
    publisher: { "@type": "Organization", name: "WordyFy", url: APP_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#0f0f11] text-white">
        <div className="max-w-2xl mx-auto px-6 pt-20 pb-20">

          <p className="text-purple-400/60 text-sm font-medium uppercase tracking-widest mb-2">{today}</p>
          <h1 className="text-2xl font-semibold text-white/50 mb-8">Word of the Day</h1>

          <div className="bg-gradient-to-br from-[#1a1235] to-[#0f0f11] border border-purple-500/20 rounded-3xl p-8 mb-6">
            <h2 className="text-8xl font-bold mb-2 tracking-tight">{word.word}</h2>
            <p className="text-white/40 italic mb-4">({word.partOfSpeech})</p>
            <p className="text-xl text-white/80 leading-relaxed mb-5">{word.meaning}</p>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2.5 mb-5">
              <span>🇮🇳</span>
              <span className="text-purple-300 text-lg">{word.hindi}</span>
            </div>
            <blockquote className="border-l-2 border-purple-500/50 pl-4 text-white/50 italic">
              &ldquo;{word.example}&rdquo;
            </blockquote>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Fun fact</p>
            <p className="text-white/60">{word.funFact}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Link href={`/word/${word.word}`} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3.5 rounded-xl text-center transition-colors">
              Learn more →
            </Link>
            <Link href="/quiz" className="bg-white/5 hover:bg-white/10 text-white font-semibold py-3.5 rounded-xl text-center transition-colors border border-white/10">
              Take quiz
            </Link>
          </div>

          <p className="text-center text-white/30 text-sm mb-3">Share today&apos;s word 👇</p>
          <div className="flex gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(`📚 Word of the day: "${word.word}"\n\n${word.meaning}\n\nHindi: ${word.hindi}\n\n${APP_URL}/word/${word.word}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 font-medium py-2.5 rounded-xl text-sm text-center transition-colors">
              📲 Share on WhatsApp
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Word of the day: "${word.word}"\n\n${word.meaning}\n\nHindi: ${word.hindi}\n\n#WordOfTheDay #Vocabulary via @wordyfy`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 font-medium py-2.5 rounded-xl text-sm text-center transition-colors">
              Post on X
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
