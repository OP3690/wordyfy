import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const APP_URL = "https://www.wordyfy.com";

const EXAM_DATA: Record<string, {
  title: string;
  headline: string;
  description: string;
  keywords: string[];
  words: { word: string; meaning: string; hindi: string }[];
}> = {
  "gre-vocabulary": {
    title: "Top GRE Vocabulary Words with Hindi Meanings — Free Practice | WordyFy",
    headline: "Master GRE Vocabulary with Hindi Translations",
    description: "Learn the most important GRE vocabulary words with Hindi meanings, example sentences, and AI-powered quizzes. 500+ high-frequency GRE words, free on WordyFy.",
    keywords: ["GRE vocabulary words", "GRE word list", "GRE vocabulary with Hindi meaning", "high frequency GRE words", "GRE preparation vocabulary"],
    words: [
      { word: "Pernicious", meaning: "Having a harmful effect, especially in a gradual or subtle way", hindi: "हानिकारक" },
      { word: "Equivocal", meaning: "Open to more than one interpretation; ambiguous", hindi: "अस्पष्ट" },
      { word: "Recalcitrant", meaning: "Having an obstinately uncooperative attitude", hindi: "अड़ियल" },
      { word: "Loquacious", meaning: "Tending to talk a great deal; talkative", hindi: "बातूनी" },
      { word: "Magnanimous", meaning: "Very generous or forgiving, especially toward a rival", hindi: "उदार" },
      { word: "Sycophant", meaning: "A person who acts obsequiously toward someone important", hindi: "चापलूस" },
    ],
  },
  "ielts-vocabulary": {
    title: "IELTS Vocabulary with Hindi Meanings — Band 7+ Words | WordyFy",
    headline: "IELTS Vocabulary for Band 7, 8 & 9",
    description: "Boost your IELTS score with academic vocabulary. Learn high-scoring IELTS words with Hindi meanings and contextual usage. Free practice on WordyFy.",
    keywords: ["IELTS vocabulary words", "IELTS academic wordlist", "IELTS vocabulary with Hindi meaning", "IELTS band 7 vocabulary"],
    words: [
      { word: "Proliferate", meaning: "Increase rapidly in numbers; multiply", hindi: "तेज़ी से बढ़ना" },
      { word: "Substantiate", meaning: "Provide evidence to support or prove the truth of", hindi: "प्रमाणित करना" },
      { word: "Mitigate", meaning: "Make less severe, serious, or painful", hindi: "कम करना" },
      { word: "Corroborate", meaning: "Confirm or give support to a statement or theory", hindi: "पुष्टि करना" },
      { word: "Ameliorate", meaning: "Make something bad or unsatisfactory better", hindi: "सुधारना" },
      { word: "Discrepancy", meaning: "A lack of compatibility between two accounts or figures", hindi: "विसंगति" },
    ],
  },
  "cat-vocabulary": {
    title: "CAT Vocabulary Words with Hindi Meanings — Free Practice | WordyFy",
    headline: "CAT English Vocabulary — Verbal Ability Booster",
    description: "Prepare for CAT verbal ability with high-frequency vocabulary words. Hindi meanings, example sentences, and AI-powered quizzes. Start free on WordyFy.",
    keywords: ["CAT vocabulary words", "CAT verbal ability vocabulary", "CAT English preparation", "verbal ability words for CAT"],
    words: [
      { word: "Perfidious", meaning: "Deceitful and untrustworthy; guilty of betrayal", hindi: "विश्वासघाती" },
      { word: "Obstreperous", meaning: "Noisy and difficult to control", hindi: "उद्दंड" },
      { word: "Perspicacious", meaning: "Having a ready insight into things; shrewd", hindi: "कुशाग्र" },
      { word: "Impecunious", meaning: "Having little or no money", hindi: "निर्धन" },
      { word: "Vociferous", meaning: "Expressing opinions in a loud and forceful way", hindi: "मुखर" },
      { word: "Tenacious", meaning: "Tending to keep a firm hold; persistent", hindi: "दृढ़" },
    ],
  },
};

type Props = { params: Promise<{ exam: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam } = await params;
  const data = EXAM_DATA[exam];
  if (!data) return { title: "Not Found" };
  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    openGraph: { title: data.headline, description: data.description, url: `${APP_URL}/learn/${exam}` },
    alternates: { canonical: `${APP_URL}/learn/${exam}` },
  };
}

export async function generateStaticParams() {
  return Object.keys(EXAM_DATA).map((exam) => ({ exam }));
}

export default async function ExamLandingPage({ params }: Props) {
  const { exam } = await params;
  const data = EXAM_DATA[exam];
  if (!data) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: data.headline,
    description: data.description,
    provider: { "@type": "Organization", name: "WordyFy", url: APP_URL },
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#0f0f11] text-white">
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-block bg-purple-500/10 text-purple-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-purple-500/20 mb-6">
            Free Preparation
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-4">{data.headline}</h1>
          <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-2xl mx-auto">{data.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">Start Free →</Link>
            <Link href="/quiz" className="bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors border border-white/10">Practice Quiz</Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-xl font-semibold mb-6 text-white/80">Sample word list</h2>
          <div className="space-y-3">
            {data.words.map((w) => (
              <Link key={w.word} href={`/word/${w.word.toLowerCase()}`}
                className="flex items-start justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-5 py-4 transition-colors group">
                <div>
                  <span className="font-semibold text-white group-hover:text-purple-300 transition-colors">{w.word}</span>
                  <p className="text-white/50 text-sm mt-0.5">{w.meaning}</p>
                </div>
                <div className="flex items-center gap-2 text-sm shrink-0 ml-4">
                  <span>🇮🇳</span>
                  <span className="text-purple-300">{w.hindi}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
              See all 500+ words — Sign up free →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
