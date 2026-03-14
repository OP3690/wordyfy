import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const APP_URL = "https://www.wordyfy.com";

interface WordData {
  word: string;
  meaning: string;
  hindi: string;
  partOfSpeech: string;
  pronunciation: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  etymology: string;
  difficulty: "intermediate" | "advanced" | "expert";
}

async function getWordData(word: string): Promise<WordData | null> {
  const mockWords: Record<string, WordData> = {
    ephemeral: {
      word: "ephemeral",
      meaning: "Lasting for a very short time; transitory",
      hindi: "क्षणभंगुर (kshaṇabhaṅgur)",
      partOfSpeech: "adjective",
      pronunciation: "/ɪˈfem(ə)r(ə)l/",
      example: "The ephemeral beauty of cherry blossoms reminds us to cherish fleeting moments.",
      synonyms: ["transient", "fleeting", "momentary", "brief", "short-lived"],
      antonyms: ["permanent", "enduring", "eternal", "everlasting"],
      etymology: "From Greek 'ephemeros' — epi (on) + hemera (day)",
      difficulty: "intermediate",
    },
    ubiquitous: {
      word: "ubiquitous",
      meaning: "Present, appearing, or found everywhere",
      hindi: "सर्वव्यापी (sarvavyāpī)",
      partOfSpeech: "adjective",
      pronunciation: "/juːˈbɪkwɪtəs/",
      example: "Smartphones have become ubiquitous in modern society.",
      synonyms: ["omnipresent", "pervasive", "universal", "widespread"],
      antonyms: ["rare", "scarce", "uncommon"],
      etymology: "From Latin 'ubique' meaning 'everywhere'",
      difficulty: "intermediate",
    },
    pernicious: {
      word: "pernicious",
      meaning: "Having a harmful effect, especially in a gradual or subtle way",
      hindi: "हानिकारक",
      partOfSpeech: "adjective",
      pronunciation: "/pəˈnɪʃəs/",
      example: "Pernicious rumors can destroy reputations.",
      synonyms: ["harmful", "damaging", "destructive", "injurious"],
      antonyms: ["beneficial", "harmless", "innocuous"],
      etymology: "From Latin 'perniciosus' — per (through) + nex (death)",
      difficulty: "advanced",
    },
    recalcitrant: {
      word: "recalcitrant",
      meaning: "Having an obstinately uncooperative attitude",
      hindi: "अड़ियल",
      partOfSpeech: "adjective",
      pronunciation: "/rɪˈkalsɪtr(ə)nt/",
      example: "The recalcitrant student refused to follow the rules.",
      synonyms: ["uncooperative", "stubborn", "obstinate", "intractable"],
      antonyms: ["compliant", "obedient", "amenable"],
      etymology: "From Latin 'recalcitrare' — kick back",
      difficulty: "advanced",
    },
    sycophant: {
      word: "sycophant",
      meaning: "A person who acts obsequiously toward someone important",
      hindi: "चापलूस",
      partOfSpeech: "noun",
      pronunciation: "/ˈsɪkəfənt/",
      example: "He was surrounded by sycophants who flattered him constantly.",
      synonyms: ["flatterer", "toady", "yes-man", "bootlicker"],
      antonyms: ["critic", "rebel", "independent"],
      etymology: "From Greek 'sykophantēs' — fig-showing (origin obscure)",
      difficulty: "advanced",
    },
    magnanimous: {
      word: "magnanimous",
      meaning: "Very generous or forgiving, especially toward a rival",
      hindi: "उदार",
      partOfSpeech: "adjective",
      pronunciation: "/maɡˈnanɪməs/",
      example: "She was magnanimous in victory, praising her opponent.",
      synonyms: ["generous", "forgiving", "benevolent", "noble"],
      antonyms: ["petty", "spiteful", "vindictive"],
      etymology: "From Latin 'magnus' (great) + 'animus' (soul)",
      difficulty: "intermediate",
    },
    loquacious: {
      word: "loquacious",
      meaning: "Tending to talk a great deal; talkative",
      hindi: "बातूनी",
      partOfSpeech: "adjective",
      pronunciation: "/ləˈkweɪʃəs/",
      example: "The loquacious guest dominated the dinner conversation.",
      synonyms: ["talkative", "verbose", "garrulous", "chatty"],
      antonyms: ["reticent", "taciturn", "silent"],
      etymology: "From Latin 'loquax' — talkative",
      difficulty: "intermediate",
    },
    equivocal: {
      word: "equivocal",
      meaning: "Open to more than one interpretation; ambiguous",
      hindi: "अस्पष्ट",
      partOfSpeech: "adjective",
      pronunciation: "/ɪˈkwɪvək(ə)l/",
      example: "Her equivocal response left us unsure of her intentions.",
      synonyms: ["ambiguous", "unclear", "vague", "cryptic"],
      antonyms: ["clear", "unambiguous", "explicit"],
      etymology: "From Latin 'aequivocus' — equal voice",
      difficulty: "advanced",
    },
    tenacious: {
      word: "tenacious",
      meaning: "Tending to keep a firm hold; persistent",
      hindi: "दृढ़",
      partOfSpeech: "adjective",
      pronunciation: "/təˈneɪʃəs/",
      example: "She was tenacious in her pursuit of the truth.",
      synonyms: ["persistent", "determined", "resolute", "steadfast"],
      antonyms: ["weak", "yielding", "irresolute"],
      etymology: "From Latin 'tenax' — holding fast",
      difficulty: "intermediate",
    },
  };
  return mockWords[word.toLowerCase()] || null;
}

type Props = { params: Promise<{ word: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { word: wordSlug } = await params;
  const data = await getWordData(wordSlug);
  if (!data) return { title: "Word Not Found" };

  const ogUrl = `${APP_URL}/api/og?type=word&word=${encodeURIComponent(data.word)}&meaning=${encodeURIComponent(data.meaning)}&hindi=${encodeURIComponent(data.hindi)}`;

  return {
    title: `${data.word} meaning in Hindi — Definition, Synonyms | WordyFy`,
    description: `${data.word} (${data.partOfSpeech}): ${data.meaning}. Hindi: ${data.hindi}. Example: "${data.example}" Learn with quizzes on WordyFy.`,
    keywords: [
      `${data.word} meaning`,
      `${data.word} meaning in Hindi`,
      `${data.word} definition`,
      `${data.word} synonyms`,
      `${data.word} ka matlab`,
    ],
    openGraph: {
      title: `${data.word} — meaning in Hindi & English`,
      description: `${data.meaning} | Hindi: ${data.hindi}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.word}: ${data.meaning.substring(0, 70)}`,
      description: `Hindi: ${data.hindi} | Learn on WordyFy 🚀`,
      images: [ogUrl],
    },
    alternates: { canonical: `${APP_URL}/word/${wordSlug}` },
  };
}

export default async function WordPage({ params }: Props) {
  const { word: wordSlug } = await params;
  const data = await getWordData(wordSlug);
  if (!data) notFound();

  const difficultyColor = {
    intermediate: "#10b981",
    advanced: "#f59e0b",
    expert: "#ef4444",
  }[data.difficulty];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: data.word,
    description: data.meaning,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#0f0f11] text-white">
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-12">

          <nav className="text-sm text-white/40 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {" / "}
            <Link href="/blog" className="hover:text-white transition-colors">Words</Link>
            {" / "}
            <span className="text-white/70">{data.word}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border"
              style={{ background: `${difficultyColor}20`, color: difficultyColor, borderColor: `${difficultyColor}40` }}>
              {data.difficulty}
            </span>
            <span className="text-white/40 text-sm">{data.partOfSpeech}</span>
          </div>

          <h1 className="text-7xl font-bold mb-2 leading-none tracking-tight">{data.word}</h1>
          <p className="text-white/40 mb-4 italic text-lg">{data.pronunciation}</p>

          <p className="text-2xl text-white/80 leading-relaxed mb-6">{data.meaning}</p>

          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-2xl px-5 py-3 mb-6">
            <span>🇮🇳</span>
            <span className="text-purple-300 text-lg">{data.hindi}</span>
          </div>

          <blockquote className="border-l-2 border-purple-500 pl-5 text-white/60 italic text-lg mb-8">
            &ldquo;{data.example}&rdquo;
          </blockquote>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link href={`/quiz?word=${data.word}`}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Quiz yourself →
            </Link>
            <Link href={`/dashboard`}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-white/10">
              + Save to Vault
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-3">Synonyms</h2>
              <div className="flex flex-wrap gap-2">
                {data.synonyms.map((s) => (
                  <Link key={s} href={`/word/${s}`}
                    className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-500/20 transition-colors">
                    {s}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-3">Antonyms</h2>
              <div className="flex flex-wrap gap-2">
                {data.antonyms.map((a) => (
                  <Link key={a} href={`/word/${a}`}
                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
                    {a}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-2">Etymology</h2>
            <p className="text-white/60">{data.etymology}</p>
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-sm text-white/40 mb-3">Share this word</p>
            <div className="flex flex-wrap gap-2">
              <a href={`https://wa.me/?text=${encodeURIComponent(`📚 Word: "${data.word}" — ${data.meaning}\n\nHindi: ${data.hindi}\n\nLearn more: ${APP_URL}/word/${data.word}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                📲 WhatsApp
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Word of the day: "${data.word}" — ${data.meaning}\n\nHindi: ${data.hindi}\n\nLearn on @wordyfy 👉 ${APP_URL}/word/${data.word}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                Post on X
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
