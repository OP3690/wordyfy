export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  author?: string;
  relatedWords?: string[];
  category?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'gre-vocabulary-words-hindi',
    title: 'GRE Vocabulary Words with Hindi Meanings: Top 100 for Exam Prep',
    excerpt: 'Master high-frequency GRE words with Hindi translations. A curated list to boost your verbal score and build confidence.',
    date: '2025-03-01',
    author: 'WordyFy',
    category: 'Exam Prep',
    relatedWords: ['ubiquitous', 'equivocal', 'laconic', 'prodigal', 'anomaly'],
    body: `
      <p>Preparing for the GRE verbal section? Learning vocabulary with Hindi meanings can speed up retention and make tough words stick.</p>
      <h3>Why Hindi + English works for GRE</h3>
      <p>When you link a new English word to a familiar Hindi concept, your brain forms stronger associations. This is especially useful for abstract GRE words that don't have a single-word Hindi equivalent—you learn the nuance.</p>
      <h3>How to use this list</h3>
      <p>Add these words to your WordyFy vault, take daily quizzes, and track your accuracy. Focus on words you consistently get wrong and review them with spaced repetition.</p>
      <h3>Next step</h3>
      <p>Take a quick quiz on words you've saved to see how well you've internalized them. Consistent practice beats cramming.</p>
    `,
  },
  {
    slug: 'how-to-improve-vocabulary',
    title: 'How to Improve Vocabulary: 7 Evidence-Based Methods',
    excerpt: 'Science-backed strategies to expand your vocabulary faster: context, spacing, and active recall with Hindi translations.',
    date: '2025-02-28',
    author: 'WordyFy',
    category: 'Learning',
    relatedWords: ['vocabulary', 'retention', 'spaced repetition'],
    body: `
      <p>Improving vocabulary isn't about memorizing lists—it's about how you learn and review.</p>
      <h3>1. Learn in context</h3>
      <p>See words in sentences and real examples. WordyFy shows definitions and examples so you learn usage, not just meaning.</p>
      <h3>2. Use spaced repetition</h3>
      <p>Review words at increasing intervals. Our quiz system surfaces words you're weak on so you don't forget them.</p>
      <h3>3. Add Hindi (or your language)</h3>
      <p>Bilingual links strengthen memory. Save words with Hindi translations in your vault and quiz yourself daily.</p>
      <h3>4. Active recall</h3>
      <p>Testing yourself with quizzes is more effective than re-reading. Take a quiz every day to lock in new words.</p>
      <h3>5. Consistency over volume</h3>
      <p>Ten words a day with review beats 100 words once. Build a habit with streaks and small goals.</p>
      <h3>6. Use the words</h3>
      <p>Write or speak new words in sentences. The more you use them, the faster they become part of your active vocabulary.</p>
      <h3>7. Track progress</h3>
      <p>Monitor your quiz accuracy and streak. Seeing improvement keeps you motivated.</p>
      <p>Ready to put this into practice? <strong>Start with a few words in your vault, then take a quiz.</strong></p>
    `,
  },
  {
    slug: 'ielts-vocabulary-hindi',
    title: 'IELTS Vocabulary with Hindi: Essential Words for Writing & Speaking',
    excerpt: 'Key IELTS vocabulary with Hindi meanings to improve your Writing and Speaking band score. Learn and quiz in one place.',
    date: '2025-02-25',
    author: 'WordyFy',
    category: 'Exam Prep',
    relatedWords: ['coherent', 'significant', 'demonstrate', 'approximately', 'however'],
    body: `
      <p>IELTS rewards range and accuracy in vocabulary. Pairing English words with Hindi meanings helps you learn faster and use them correctly in essays and speaking.</p>
      <h3>High-value words for IELTS</h3>
      <p>Focus on words that appear in academic and general topics: cause-effect, comparison, opinion, and data description. Add them to your WordyFy vault and practice with quizzes.</p>
      <h3>Practice tip</h3>
      <p>After learning a word, use it in a sentence similar to an IELTS task. Then quiz yourself on it the next day to reinforce.</p>
      <p>Build your list, take quizzes, and track your streak to stay consistent until exam day.</p>
    `,
  },
  {
    slug: 'english-words-daily',
    title: 'Learn One English Word a Day: Why It Works and How to Start',
    excerpt: 'One word a day beats cramming. Here’s how to build a daily habit and use WordyFy to never miss a day.',
    date: '2025-02-20',
    author: 'WordyFy',
    category: 'Habits',
    relatedWords: ['habit', 'streak', 'daily'],
    body: `
      <p>Learning one word a day is sustainable. In a year, that's 365 new words without burnout.</p>
      <h3>Why one word a day</h3>
      <p>Small commitments are easier to keep. You're more likely to review and use one word than to forget a long list.</p>
      <h3>How to do it with WordyFy</h3>
      <p>Add one new word to your vault every day—from articles, books, or our blog. Take the daily quiz to review old words and reinforce the new one. Keep your streak to build the habit.</p>
      <h3>Turn it into a habit</h3>
      <p>Pair "one word" with something you already do (e.g. morning coffee). Enable reminders so you don't break your streak.</p>
      <p>Start today: add one word, then take a quick quiz.</p>
    `,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
