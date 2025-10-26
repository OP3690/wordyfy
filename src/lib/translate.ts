import axios from 'axios';
import { Word, WordDefinition, WordExample } from '@/types/word';
import { getLibreTranslate } from './libretranslate';

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id';

export async function translateToHindi(text: string): Promise<string> {
  try {
    // Use v2 API directly (simpler and works with API key)
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: 'hi',
        source: 'en',
        format: 'text'
      }
    );

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation API failed:', error);
    throw new Error('Failed to translate word');
  }
}

// Additional v2 API functions for enhanced functionality
export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text
      }
    );

    return response.data.data.detections[0][0].language;
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English
  }
}

export async function getSupportedLanguages(): Promise<any[]> {
  try {
    const response = await axios.get(
      `https://translation.googleapis.com/language/translate/v2/languages?key=${GOOGLE_TRANSLATE_API_KEY}`
    );

    return response.data.data.languages;
  } catch (error) {
    console.error('Get supported languages error:', error);
    return [];
  }
}

export async function getComprehensiveWordDetails(englishWord: string): Promise<Partial<Word>> {
  try {
    // Get translations from both Google Translate and LibreTranslate
    const [googleTranslation, libreTranslation] = await Promise.allSettled([
      translateToHindi(englishWord),
      getLibreTranslate(englishWord, 'en', 'hi')
    ]);

    // Use the best available translation
    let hindiTranslation = '';
    let translationSource = '';

    if (googleTranslation.status === 'fulfilled') {
      hindiTranslation = googleTranslation.value;
      translationSource = 'Google Translate';
    } else if (libreTranslation.status === 'fulfilled' && libreTranslation.value) {
      hindiTranslation = libreTranslation.value;
      translationSource = 'LibreTranslate';
    } else {
      // Fallback to a simple translation
      hindiTranslation = `[Translation not available]`;
      translationSource = 'Fallback';
    }

    // Create word details with enhanced translation information
    const wordDetails: Partial<Word> = {
      englishWord: englishWord.toLowerCase().trim(),
      hindiTranslation,
      translation: hindiTranslation, // Also set the main translation field
      pronunciation: generatePronunciation(englishWord),
      partOfSpeech: generatePartOfSpeech(englishWord),
      createdAt: new Date(),
      reviewCount: 0,
      // Add translation metadata
      translationSource,
      // Include both translations if available
      alternativeTranslations: {
        google: googleTranslation.status === 'fulfilled' ? googleTranslation.value : null,
        libre: libreTranslation.status === 'fulfilled' ? libreTranslation.value : null
      }
    };

    return wordDetails;
  } catch (error) {
    console.error('Error getting word details:', error);
    throw new Error('Failed to get word details');
  }
}

// Helper functions to generate comprehensive word data
function generatePronunciation(word: string): string {
  // Simple pronunciation guide (in a real app, you'd use a pronunciation API)
  const pronunciationMap: { [key: string]: string } = {
    'hello': '/həˈloʊ/',
    'world': '/wɜːrld/',
    'beautiful': '/ˈbjuːtɪfəl/',
    'computer': '/kəmˈpjuːtər/',
    'education': '/ˌedʒəˈkeɪʃən/',
    'proxy': '/ˈprɑːksi/',
    'example': '/ɪɡˈzæmpəl/',
    'learning': '/ˈlɜːrnɪŋ/',
    'knowledge': '/ˈnɑːlɪdʒ/',
    'language': '/ˈlæŋɡwɪdʒ/'
  };
  
  return pronunciationMap[word.toLowerCase()] || `/${word.toLowerCase()}/`;
}

function generatePartOfSpeech(word: string): string {
  // Simple part of speech detection (in a real app, you'd use NLP)
  const posMap: { [key: string]: string } = {
    'hello': 'interjection',
    'world': 'noun',
    'beautiful': 'adjective',
    'computer': 'noun',
    'education': 'noun',
    'proxy': 'noun',
    'example': 'noun',
    'learning': 'noun',
    'knowledge': 'noun',
    'language': 'noun'
  };
  
  return posMap[word.toLowerCase()] || 'noun';
}

function generateDefinitions(englishWord: string, hindiTranslation: string): WordDefinition[] {
  const definitionMap: { [key: string]: WordDefinition[] } = {
    'generation': [
      {
        definition: 'All the people in a family, group or country who were born at about the same time',
        example: 'We should look after the planet for future generations.',
        synonyms: [],
        antonyms: []
      },
      {
        definition: 'The average time that children take to grow up and have children of their own, usually considered to be about 25-30 years',
        example: 'A generation ago, foreign travel was still only possible for a few people.',
        synonyms: [],
        antonyms: []
      },
      {
        definition: 'The production of something, especially heat, power, etc.',
        example: 'The new generation of smartphones has better cameras.',
        synonyms: [],
        antonyms: []
      }
    ],
    'proxy': [
      {
        definition: 'A person authorized to act on behalf of another',
        example: 'He acted as a proxy for the company during the meeting.',
      synonyms: [],
        antonyms: []
      },
      {
        definition: 'A server that acts as an intermediary for requests from clients seeking resources from other servers',
        example: 'The proxy server helps protect your privacy online.',
      synonyms: [],
        antonyms: []
      },
      {
        definition: 'The authority to represent someone else, especially in voting',
        example: 'She voted by proxy since she couldn\'t attend the meeting.',
      }
    ],
    'beautiful': [
      {
        definition: 'Pleasing the senses or mind aesthetically',
        example: 'The sunset over the mountains was absolutely beautiful.',
      synonyms: [],
        antonyms: []
      },
      {
        definition: 'Of a very high standard; excellent',
        example: 'She has a beautiful voice that captivates everyone.',
      synonyms: [],
        antonyms: []
      },
      {
        definition: 'Having qualities that give great pleasure or satisfaction to see, hear, think about, etc.',
        example: 'The beautiful architecture of the old building amazed the tourists.',
      }
    ],
    'computer': [
      {
        definition: 'An electronic device for storing and processing data, typically in binary form',
        example: 'My computer crashed while I was working on an important project.',
      },
      {
        definition: 'A person who makes calculations or computations',
        example: 'The computer lab has the latest technology for students.',
      synonyms: [],
        antonyms: []
      },
      {
        definition: 'A machine that can be programmed to carry out sequences of arithmetic or logical operations automatically',
        example: 'She learned to program on her father\'s computer.',
      }
    ],
    'education': [
      {
        definition: 'The process of receiving or giving systematic instruction, especially at a school or university',
        example: 'Education is the key to success in life.',
      },
      {
        definition: 'The theory and practice of teaching',
        example: 'The government is investing more in education this year.',
      synonyms: [],
        antonyms: []
      },
      {
        definition: 'Information about or training in a particular subject',
        example: 'Online education has become very popular during the pandemic.',
      }
    ],
    'knowledge': [
      {
        definition: 'Facts, information, and skills acquired through experience or education',
        example: 'Knowledge is power, but wisdom is even more valuable.',
      },
      {
        definition: 'The theoretical or practical understanding of a subject',
        example: 'She has extensive knowledge of ancient history.',
      synonyms: [],
        antonyms: []
      },
      {
        definition: 'Awareness or familiarity gained by experience of a fact or situation',
        example: 'Sharing knowledge with others helps everyone grow.',
      }
    ],
    'learning': [
      {
        definition: 'The acquisition of knowledge or skills through study, experience, or being taught',
        example: 'Learning never stops, even after graduation.',
      },
      {
        definition: 'Knowledge acquired through experience, study, or being taught',
        example: 'The learning process can be challenging but rewarding.',
      },
      {
        definition: 'The cognitive process of acquiring skill or knowledge',
        example: 'Active learning helps students retain information better.',
      }
    ],
    'world': [
      {
        definition: 'The earth, together with all of its countries, peoples, and natural features',
        example: 'The world is becoming more connected through technology.',
      },
      {
        definition: 'A particular region or group of countries',
        example: 'Traveling the world broadens your perspective on life.',
      synonyms: [],
        antonyms: []
      },
      {
        definition: 'All of the people, societies, and institutions on the earth',
        example: 'The world\'s population continues to grow rapidly.',
      }
    ]
  };
  
  return definitionMap[englishWord.toLowerCase()] || [
    {
      definition: `The Hindi translation of "${englishWord}" is "${hindiTranslation}"`,
      example: `Example: The word "${englishWord}" means "${hindiTranslation}" in Hindi.`,
    }
  ];
}

function generateExamples(englishWord: string, hindiTranslation: string): WordExample[] {
  const exampleMap: { [key: string]: WordExample[] } = {
    'generation': [
      {
        english: "We should look after the planet for future generations.",
        hindi: "हमें भविष्य की पीढ़ियों के लिए ग्रह की देखभाल करनी चाहिए।",
      },
      {
        english: "This photograph shows three generations of my family - children, parents and grandparents.",
        hindi: "यह तस्वीर मेरे परिवार की तीन पीढ़ियों को दिखाती है - बच्चे, माता-पिता और दादा-दादी।",
      },
      {
        english: "A generation ago, foreign travel was still only possible for a few people.",
        hindi: "एक पीढ़ी पहले, विदेश यात्रा अभी भी कुछ लोगों के लिए ही संभव थी।",
      },
      {
        english: "The new generation of smartphones has better cameras.",
        hindi: "स्मार्टफोन की नई पीढ़ी में बेहतर कैमरे हैं।",
      }
    ],
    'proxy': [
      {
        english: "He acted as a proxy for the company during the meeting.",
        hindi: "बैठक के दौरान उन्होंने कंपनी के लिए प्रतिनिधि के रूप में काम किया।",
      },
      {
        english: "The proxy server helps protect your privacy online.",
        hindi: "प्रॉक्सी सर्वर आपकी ऑनलाइन गोपनीयता की रक्षा करने में मदद करता है।",
      },
      {
        english: "She voted by proxy since she couldn't attend the meeting.",
        hindi: "चूंकि वह बैठक में शामिल नहीं हो सकी, उसने प्रॉक्सी के माध्यम से वोट दिया।",
      }
    ],
    'beautiful': [
      {
        english: "The sunset over the mountains was absolutely beautiful.",
        hindi: "पहाड़ों पर सूर्यास्त बिल्कुल सुंदर था।",
      },
      {
        english: "She has a beautiful voice that captivates everyone.",
        hindi: "उसकी आवाज़ बहुत सुंदर है जो सभी को मोहित कर देती है।",
      },
      {
        english: "The beautiful architecture of the old building amazed the tourists.",
        hindi: "पुरानी इमारत की सुंदर वास्तुकला ने पर्यटकों को आश्चर्यचकित कर दिया।",
      }
    ],
    'computer': [
      {
        english: "My computer crashed while I was working on an important project.",
        hindi: "मेरा कंप्यूटर तब क्रैश हो गया जब मैं एक महत्वपूर्ण प्रोजेक्ट पर काम कर रहा था।",
      },
      {
        english: "The computer lab has the latest technology for students.",
        hindi: "कंप्यूटर लैब में छात्रों के लिए नवीनतम तकनीक है।",
      },
      {
        english: "She learned to program on her father's computer.",
        hindi: "उसने अपने पिता के कंप्यूटर पर प्रोग्रामिंग सीखी।",
      }
    ],
    'education': [
      {
        english: "Education is the key to success in life.",
        hindi: "शिक्षा जीवन में सफलता की कुंजी है।",
      },
      {
        english: "The government is investing more in education this year.",
        hindi: "सरकार इस साल शिक्षा में अधिक निवेश कर रही है।",
      },
      {
        english: "Online education has become very popular during the pandemic.",
        hindi: "महामारी के दौरान ऑनलाइन शिक्षा बहुत लोकप्रिय हो गई है।",
      }
    ],
    'knowledge': [
      {
        english: "Knowledge is power, but wisdom is even more valuable.",
        hindi: "ज्ञान शक्ति है, लेकिन बुद्धि और भी मूल्यवान है।",
      },
      {
        english: "She has extensive knowledge of ancient history.",
        hindi: "उसे प्राचीन इतिहास का व्यापक ज्ञान है।",
      },
      {
        english: "Sharing knowledge with others helps everyone grow.",
        hindi: "दूसरों के साथ ज्ञान साझा करना सभी को बढ़ने में मदद करता है।",
      }
    ],
    'learning': [
      {
        english: "Learning never stops, even after graduation.",
        hindi: "स्नातक के बाद भी सीखना कभी नहीं रुकता।",
      },
      {
        english: "The learning process can be challenging but rewarding.",
        hindi: "सीखने की प्रक्रिया चुनौतीपूर्ण हो सकती है लेकिन फायदेमंद भी।",
      },
      {
        english: "Active learning helps students retain information better.",
        hindi: "सक्रिय सीखना छात्रों को जानकारी को बेहतर तरीके से याद रखने में मदद करता है।",
      }
    ],
    'world': [
      {
        english: "The world is becoming more connected through technology.",
        hindi: "दुनिया तकनीक के माध्यम से अधिक जुड़ी हुई हो रही है।",
      },
      {
        english: "Traveling the world broadens your perspective on life.",
        hindi: "दुनिया की यात्रा करना जीवन के प्रति आपके दृष्टिकोण को व्यापक बनाता है।",
      },
      {
        english: "The world's population continues to grow rapidly.",
        hindi: "दुनिया की जनसंख्या तेजी से बढ़ती जा रही है।",
      }
    ]
  };
  
  return exampleMap[englishWord.toLowerCase()] || [
    {
      english: `The word "${englishWord}" is commonly used in English.`,
      hindi: `"${hindiTranslation}" शब्द हिंदी में आमतौर पर प्रयोग किया जाता है।`,
    },
    {
      english: `Learning "${englishWord}" helps improve vocabulary.`,
      hindi: `"${hindiTranslation}" सीखना शब्दावली को बेहतर बनाने में मदद करता है।`,
    }
  ];
}

function generateSynonyms(englishWord: string): string[] {
  const synonymMap: { [key: string]: string[] } = {
    'proxy': ['representative', 'substitute', 'agent', 'delegate', 'stand-in', 'surrogate'],
    'beautiful': ['attractive', 'lovely', 'gorgeous', 'stunning', 'pretty', 'elegant', 'charming'],
    'computer': ['machine', 'device', 'system', 'processor', 'PC', 'laptop', 'workstation'],
    'education': ['learning', 'instruction', 'training', 'schooling', 'teaching', 'tuition', 'enlightenment'],
    'example': ['instance', 'sample', 'illustration', 'model', 'specimen', 'case', 'demonstration'],
    'learning': ['studying', 'education', 'knowledge', 'understanding', 'scholarship', 'acquisition'],
    'knowledge': ['information', 'understanding', 'wisdom', 'expertise', 'awareness', 'comprehension'],
    'language': ['tongue', 'speech', 'communication', 'dialect', 'vernacular', 'idiom'],
    'generation': ['age', 'era', 'period', 'cohort', 'breed', 'lineage', 'descendants'],
    'world': ['globe', 'earth', 'planet', 'universe', 'realm', 'domain', 'sphere'],
    'hello': ['hi', 'greetings', 'salutations', 'hey', 'good day', 'welcome'],
    'good': ['excellent', 'great', 'wonderful', 'fine', 'superb', 'outstanding', 'marvelous'],
    'bad': ['terrible', 'awful', 'horrible', 'dreadful', 'poor', 'inferior', 'substandard'],
    'big': ['large', 'huge', 'enormous', 'massive', 'giant', 'colossal', 'immense'],
    'small': ['tiny', 'little', 'miniature', 'mini', 'petite', 'compact', 'diminutive'],
    'fast': ['quick', 'rapid', 'swift', 'speedy', 'brisk', 'fleet', 'hasty'],
    'slow': ['sluggish', 'leisurely', 'gradual', 'delayed', 'unhurried', 'lazy', 'tardy'],
    'happy': ['joyful', 'cheerful', 'glad', 'pleased', 'content', 'delighted', 'ecstatic'],
    'sad': ['unhappy', 'depressed', 'melancholy', 'gloomy', 'sorrowful', 'dejected', 'miserable'],
    'love': ['adore', 'cherish', 'treasure', 'worship', 'admire', 'esteem', 'affection'],
    'hate': ['despise', 'loathe', 'detest', 'abhor', 'dislike', 'abominate', 'scorn']
  };
  
  return synonymMap[englishWord.toLowerCase()] || [];
}

function generateAntonyms(englishWord: string): string[] {
  const antonymMap: { [key: string]: string[] } = {
    'beautiful': ['ugly', 'unattractive', 'plain', 'hideous', 'repulsive', 'disgusting'],
    'knowledge': ['ignorance', 'unawareness', 'confusion', 'misunderstanding', 'illiteracy'],
    'learning': ['forgetting', 'ignorance', 'unlearning', 'disregard', 'neglect'],
    'good': ['bad', 'evil', 'wicked', 'wrong', 'harmful', 'detrimental'],
    'bad': ['good', 'excellent', 'wonderful', 'great', 'beneficial', 'positive'],
    'big': ['small', 'tiny', 'little', 'miniature', 'compact', 'diminutive'],
    'small': ['big', 'large', 'huge', 'enormous', 'giant', 'massive'],
    'fast': ['slow', 'sluggish', 'gradual', 'delayed', 'leisurely', 'tardy'],
    'slow': ['fast', 'quick', 'rapid', 'swift', 'speedy', 'brisk'],
    'happy': ['sad', 'unhappy', 'depressed', 'miserable', 'gloomy', 'melancholy'],
    'sad': ['happy', 'joyful', 'cheerful', 'glad', 'delighted', 'ecstatic'],
    'love': ['hate', 'despise', 'loathe', 'detest', 'abhor', 'dislike'],
    'hate': ['love', 'adore', 'cherish', 'treasure', 'admire', 'affection'],
    'beautiful': ['ugly', 'unattractive', 'plain', 'hideous', 'repulsive'],
    'knowledge': ['ignorance', 'unawareness', 'confusion', 'misunderstanding'],
    'learning': ['forgetting', 'ignorance', 'unlearning', 'disregard'],
    'generation': ['individual', 'single', 'one', 'alone', 'isolated'],
    'world': ['nothing', 'void', 'emptiness', 'vacuum', 'absence']
  };
  
  return antonymMap[englishWord.toLowerCase()] || [];
}

function generateEtymology(word: string): string {
  const etymologyMap: { [key: string]: string } = {
    'proxy': 'From Middle French "procuration", meaning "agency"',
    'computer': 'From Latin "computare", meaning "to calculate"',
    'education': 'From Latin "educare", meaning "to bring up, train"',
    'language': 'From Old French "langage", from Latin "lingua"',
    'knowledge': 'From Old English "cnawan", meaning "to know"'
  };
  
  return etymologyMap[word.toLowerCase()] || `Origin and history of the word "${word}"`;
}

function generateUsage(word: string): string {
  return `The word "${word}" is commonly used in formal and informal contexts. It appears frequently in written and spoken English.`;
}
