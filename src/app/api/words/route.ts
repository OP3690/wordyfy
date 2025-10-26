import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getComprehensiveWordDetails } from '@/lib/translate';
import { getWordDetails, extractEnhancedWordData } from '@/lib/dictionary';
import { saveWord, getStoredWords } from '@/lib/storage';
import { translateWithFallback } from '@/lib/libretranslate';
import { Word } from '@/types/word';

// Validation functions
function isValidEnglishWord(word: string): boolean {
  // Check if word contains only letters and spaces
  return /^[A-Za-z\s]+$/.test(word);
}

function isCleanWord(word: string): boolean {
  // Remove extra spaces and check length
  const cleanWord = word.trim().replace(/\s+/g, ' ');
  return cleanWord.length >= 2 && cleanWord.length <= 50;
}

async function isRealWord(word: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    return response.ok;
  } catch (error) {
    console.error('Error checking if word exists:', error);
    return false;
  }
}

// Function to store synonyms and antonyms as separate words for quiz functionality
async function storeRelatedWords(wordsCollection: any, userId: string, meanings: any[]): Promise<void> {
  if (!meanings || !Array.isArray(meanings)) return;
  
  const relatedWords: any[] = [];
  
  // Collect all unique related words first
  const uniqueWords = new Set<string>();
  
  meanings.forEach((meaning) => {
    // Collect synonyms
    if (meaning.synonyms && Array.isArray(meaning.synonyms)) {
      meaning.synonyms.forEach((synonym: any) => {
        if (typeof synonym === 'object' && synonym.english && synonym.hindi) {
          uniqueWords.add(synonym.english.toLowerCase());
        }
      });
    }
    
    // Collect antonyms
    if (meaning.antonyms && Array.isArray(meaning.antonyms)) {
      meaning.antonyms.forEach((antonym: any) => {
        if (typeof antonym === 'object' && antonym.english && antonym.hindi) {
          uniqueWords.add(antonym.english.toLowerCase());
        }
      });
    }
  });
  
  // Fetch dictionary data for each unique word
  for (const word of uniqueWords) {
    try {
      // Check if word already exists
      const existingWord = await wordsCollection.findOne({
        englishWord: word,
        userId,
        isRelatedWord: true
      });
      
      if (existingWord) {
        console.log(`⏭️ Related word "${word}" already exists, skipping`);
        continue;
      }
      
      console.log(`🔍 Fetching dictionary data for related word: ${word}`);
      
      // Get comprehensive word details
      const wordDetails = await getComprehensiveWordDetails(word);
      if (!wordDetails) {
        console.log(`❌ Failed to get word details for: ${word}`);
        continue;
      }
      
      // Get enhanced word details from Dictionary API
      const dictionaryData = await getWordDetails(word);
      const enhancedData = dictionaryData ? extractEnhancedWordData(dictionaryData, wordDetails.hindiTranslation) : null;
      
      // Determine if it's a synonym or antonym
      let relatedTo = 'synonym';
      meanings.forEach((meaning) => {
        if (meaning.synonyms && Array.isArray(meaning.synonyms)) {
          meaning.synonyms.forEach((synonym: any) => {
            if (typeof synonym === 'object' && synonym.english && synonym.english.toLowerCase() === word) {
              relatedTo = 'synonym';
            }
          });
        }
        if (meaning.antonyms && Array.isArray(meaning.antonyms)) {
          meaning.antonyms.forEach((antonym: any) => {
            if (typeof antonym === 'object' && antonym.english && antonym.english.toLowerCase() === word) {
              relatedTo = 'antonym';
            }
          });
        }
      });
      
      // Create the related word entry
      const relatedWord = {
        englishWord: word,
        translation: wordDetails.hindiTranslation,
        fromLanguage: 'en',
        toLanguage: 'hi',
        pronunciation: enhancedData?.pronunciation || '',
        partOfSpeech: enhancedData?.partOfSpeech || 'noun',
        createdAt: new Date(),
        reviewCount: 0,
        userId,
        popularity: 1,
        isPublic: true,
        isRelatedWord: true,
        relatedTo,
        phonetics: enhancedData?.phonetics || [],
        meanings: enhancedData?.meanings || [{
          partOfSpeech: 'noun',
          definitions: [{
            definition: `The word "${word}" means ${wordDetails.hindiTranslation} in Hindi.`,
            example: `Example: The ${word} option is now available.`,
            synonyms: [],
            antonyms: []
          }]
        }],
        audioUrl: enhancedData?.audioUrl,
        translationSource: wordDetails.translationSource,
        alternativeTranslations: wordDetails.alternativeTranslations,
        hindiTranslation: wordDetails.hindiTranslation,
      };
      
      relatedWords.push(relatedWord);
      console.log(`✅ Prepared related word: ${word} (${relatedTo})`);
      
    } catch (error) {
      console.error(`❌ Error processing related word "${word}":`, error);
    }
  }
  
  // Insert all related words if any exist
  if (relatedWords.length > 0) {
    try {
      await wordsCollection.insertMany(relatedWords);
      console.log(`✅ Stored ${relatedWords.length} related words for quiz functionality`);
    } catch (error) {
      console.error('Error storing related words:', error);
    }
  }
}

// Function to automatically translate examples, synonyms, and antonyms
async function translateExamples(meanings: any[]): Promise<any[]> {
  if (!meanings || !Array.isArray(meanings)) return meanings;
  
  const translatedMeanings = await Promise.all(
    meanings.map(async (meaning) => {
      if (!meaning.definitions || !Array.isArray(meaning.definitions)) return meaning;
      
      const translatedDefinitions = await Promise.all(
        meaning.definitions.map(async (definition: any) => {
          if (!definition.example) return definition;
          
          try {
            console.log(`🔄 Auto-translating example: "${definition.example}"`);
            const hindiTranslation = await translateWithFallback(definition.example, 'en', 'hi');
            
            if (hindiTranslation) {
              console.log(`✅ Auto-translation successful: "${definition.example}" → "${hindiTranslation}"`);
              return {
                ...definition,
                hindiExample: hindiTranslation
              };
            } else {
              console.log(`❌ Auto-translation failed for: "${definition.example}"`);
              return definition;
            }
          } catch (error) {
            console.error('Error auto-translating example:', error);
            return definition;
          }
        })
      );
      
      // Translate synonyms
      let translatedSynonyms = meaning.synonyms;
      if (meaning.synonyms && Array.isArray(meaning.synonyms) && meaning.synonyms.length > 0) {
        console.log(`🔄 Auto-translating synonyms:`, meaning.synonyms);
        translatedSynonyms = await Promise.all(
          meaning.synonyms.map(async (synonym: string) => {
            try {
              // Capitalize first letter
              const capitalizedSynonym = synonym.charAt(0).toUpperCase() + synonym.slice(1);
              const hindiTranslation = await translateWithFallback(synonym, 'en', 'hi');
              if (hindiTranslation) {
                console.log(`✅ Synonym translation: "${synonym}" → "${hindiTranslation}"`);
                return {
                  english: capitalizedSynonym,
                  hindi: hindiTranslation
                };
              }
              return { english: capitalizedSynonym, hindi: null };
            } catch (error) {
              console.error('Error translating synonym:', error);
              return { english: synonym.charAt(0).toUpperCase() + synonym.slice(1), hindi: null };
            }
          })
        );
      }
      
      // Translate antonyms
      let translatedAntonyms = meaning.antonyms;
      if (meaning.antonyms && Array.isArray(meaning.antonyms) && meaning.antonyms.length > 0) {
        console.log(`🔄 Auto-translating antonyms:`, meaning.antonyms);
        translatedAntonyms = await Promise.all(
          meaning.antonyms.map(async (antonym: string) => {
            try {
              // Capitalize first letter
              const capitalizedAntonym = antonym.charAt(0).toUpperCase() + antonym.slice(1);
              const hindiTranslation = await translateWithFallback(antonym, 'en', 'hi');
              if (hindiTranslation) {
                console.log(`✅ Antonym translation: "${antonym}" → "${hindiTranslation}"`);
                return {
                  english: capitalizedAntonym,
                  hindi: hindiTranslation
                };
              }
              return { english: capitalizedAntonym, hindi: null };
            } catch (error) {
              console.error('Error translating antonym:', error);
              return { english: antonym.charAt(0).toUpperCase() + antonym.slice(1), hindi: null };
            }
          })
        );
      }
      
      return {
        ...meaning,
        definitions: translatedDefinitions,
        synonyms: translatedSynonyms,
        antonyms: translatedAntonyms
      };
    })
  );
  
  return translatedMeanings;
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const { englishWord, userId, fromLanguage, toLanguage } = await request.json();
    
    if (!englishWord || !userId) {
      return NextResponse.json({ error: 'English word and userId are required' }, { status: 400 });
    }

    // Clean and validate the word
    const cleanWord = englishWord.trim().replace(/\s+/g, ' ');
    
    // Validation checks
    if (!isValidEnglishWord(cleanWord)) {
      return NextResponse.json({ 
        error: 'Please use only letters (A-Z). Numbers and special characters are not allowed.',
        code: 'INVALID_FORMAT'
      }, { status: 400 });
    }

    if (!isCleanWord(cleanWord)) {
      return NextResponse.json({ 
        error: 'Word must be between 2-50 characters long.',
        code: 'INVALID_LENGTH'
      }, { status: 400 });
    }

    // Check if it's a real English word
    const isReal = await isRealWord(cleanWord);
    if (!isReal) {
      return NextResponse.json({ 
        error: 'This word does not exist in the English dictionary. Please check your spelling or try a different word.',
        code: 'NOT_REAL_WORD'
      }, { status: 400 });
    }

    // Get comprehensive word details from Google Translate
    const wordDetails = await getComprehensiveWordDetails(cleanWord);
    
    if (!wordDetails) {
      return NextResponse.json({ error: 'Failed to get word details' }, { status: 500 });
    }

    // Get enhanced word details from Dictionary API
    const dictionaryData = await getWordDetails(cleanWord);
    console.log('Dictionary API response for', cleanWord, ':', dictionaryData);
    const enhancedData = dictionaryData ? extractEnhancedWordData(dictionaryData, wordDetails.hindiTranslation) : null;
    console.log('Enhanced data extracted:', enhancedData);

    // Automatically translate examples if meanings exist
    let translatedMeanings = enhancedData?.meanings;
    if (translatedMeanings && translatedMeanings.length > 0) {
      console.log('🔄 Auto-translating examples for word:', cleanWord);
      translatedMeanings = await translateExamples(translatedMeanings);
      console.log('✅ Auto-translation completed for word:', cleanWord);
    }

    // Check if word already exists for this user
    const existingWord = await db.collection('words').findOne({
      englishWord: cleanWord.toLowerCase(),
      userId,
      fromLanguage,
      toLanguage
    });

    if (existingWord) {
      // Even for existing words, fetch enhanced data for popup display
      const dictionaryData = await getWordDetails(cleanWord);
      const enhancedData = dictionaryData ? extractEnhancedWordData(dictionaryData, wordDetails.hindiTranslation) : null;
      
      // Auto-translate examples for existing words too
      let translatedMeanings = enhancedData?.meanings;
      if (translatedMeanings && translatedMeanings.length > 0) {
        console.log('🔄 Auto-translating examples for existing word:', cleanWord);
        translatedMeanings = await translateExamples(translatedMeanings);
        console.log('✅ Auto-translation completed for existing word:', cleanWord);
      }
      
      // Merge enhanced data with existing word
      const enhancedExistingWord = {
        ...existingWord,
        ...enhancedData,
        // Keep original data if enhanced data is not available
        meanings: translatedMeanings || existingWord.meanings || [{
          partOfSpeech: 'adjective',
          definitions: [{
            definition: `The word "${cleanWord}" means ${wordDetails.hindiTranslation} in Hindi.`,
            example: `Example: The ${cleanWord} option is now available.`,
            synonyms: [],
            antonyms: []
          }]
        }],
        phonetics: enhancedData?.phonetics || existingWord.phonetics,
        audioUrl: enhancedData?.audioUrl || existingWord.audioUrl,
        pronunciation: enhancedData?.pronunciation || existingWord.pronunciation,
        partOfSpeech: enhancedData?.partOfSpeech || existingWord.partOfSpeech
      };
      
      return NextResponse.json({ 
        success: false, 
        message: 'Word already exists in your collection',
        word: enhancedExistingWord
      });
    }

    // Create new word with user context
    const newWord: Word = {
      englishWord: cleanWord.toLowerCase(),
      translation: wordDetails.hindiTranslation,
      fromLanguage: fromLanguage || 'en',
      toLanguage: toLanguage || 'hi',
      pronunciation: enhancedData?.pronunciation || wordDetails.pronunciation,
      partOfSpeech: enhancedData?.partOfSpeech || wordDetails.partOfSpeech,
      createdAt: new Date(),
      reviewCount: 0,
      userId,
      popularity: 1,
      isPublic: true,
      // Enhanced fields from Dictionary API with auto-translated examples
      phonetics: enhancedData?.phonetics,
      meanings: translatedMeanings || [{
        partOfSpeech: 'adjective',
        definitions: [{
          definition: `The word "${cleanWord}" means ${wordDetails.hindiTranslation} in Hindi.`,
          example: `Example: The ${cleanWord} option is now available.`,
          synonyms: [],
          antonyms: []
        }]
      }],
      audioUrl: enhancedData?.audioUrl,
      // Translation metadata
      translationSource: wordDetails.translationSource,
      alternativeTranslations: wordDetails.alternativeTranslations,
      hindiTranslation: wordDetails.hindiTranslation,
    };

    // Save to MongoDB
    const result = await db.collection('words').insertOne(newWord);

    // Store all synonyms and antonyms as separate words for quiz functionality
    await storeRelatedWords(db.collection('words'), userId, translatedMeanings);

    // Update popularity count for this word across all users
    await db.collection('words').updateMany(
      { 
        englishWord: cleanWord.toLowerCase(),
        fromLanguage,
        toLanguage
      },
      { $inc: { popularity: 1 } }
    );

    return NextResponse.json({ 
      success: true, 
      word: { ...newWord, _id: result.insertedId }
    });
  } catch (error) {
    console.error('MongoDB error, using fallback storage:', error);
    
        // Fallback to localStorage
        try {
          const { englishWord } = await request.json();
          const cleanWord = englishWord.trim().replace(/\s+/g, ' ');
          const wordDetails = await getComprehensiveWordDetails(cleanWord);
      
      if (wordDetails) {
        const savedWord = saveWord(wordDetails);
        return NextResponse.json({ 
          success: true, 
          word: savedWord,
          fallback: true 
        });
      }
    } catch (fallbackError) {
      console.error('Fallback storage error:', fallbackError);
    }
    
    return NextResponse.json({ error: 'Failed to save word' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const { englishWord, userId, fromLanguage, toLanguage } = await request.json();
    
    if (!englishWord || !userId) {
      return NextResponse.json({ error: 'English word and userId are required' }, { status: 400 });
    }

    // Clean and validate the word
    const cleanWord = englishWord.trim().replace(/\s+/g, ' ');
    
    // Find the existing word
    const existingWord = await db.collection('words').findOne({
      englishWord: cleanWord.toLowerCase(),
      userId,
      fromLanguage: fromLanguage || 'en',
      toLanguage: toLanguage || 'hi'
    });

    if (!existingWord) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    console.log(`🔄 Updating existing word with proper dictionary data: ${cleanWord}`);

    // Get comprehensive word details from Google Translate
    const wordDetails = await getComprehensiveWordDetails(cleanWord);
    
    if (!wordDetails) {
      return NextResponse.json({ error: 'Failed to get word details' }, { status: 500 });
    }

    // Get enhanced word details from Dictionary API
    const dictionaryData = await getWordDetails(cleanWord);
    console.log('Dictionary API response for', cleanWord, ':', dictionaryData);
    const enhancedData = dictionaryData ? extractEnhancedWordData(dictionaryData, wordDetails.hindiTranslation) : null;
    console.log('Enhanced data extracted:', enhancedData);

    // Automatically translate examples if meanings exist
    let translatedMeanings = enhancedData?.meanings;
    if (translatedMeanings && translatedMeanings.length > 0) {
      console.log('🔄 Auto-translating examples for updated word:', cleanWord);
      translatedMeanings = await translateExamples(translatedMeanings);
      console.log('✅ Auto-translation completed for updated word:', cleanWord);
    }

    // Update the word with enhanced data
    const updatedWord = {
      ...existingWord,
      ...enhancedData,
      meanings: translatedMeanings || existingWord.meanings || [{
        partOfSpeech: 'adjective',
        definitions: [{
          definition: `The word "${cleanWord}" means ${wordDetails.hindiTranslation} in Hindi.`,
          example: `Example: The ${cleanWord} option is now available.`,
          synonyms: [],
          antonyms: []
        }]
      }],
      audioUrl: enhancedData?.audioUrl,
      // Translation metadata - update both fields to ensure consistency
      translation: wordDetails.hindiTranslation, // Fix: Update the main translation field
      translationSource: wordDetails.translationSource,
      alternativeTranslations: wordDetails.alternativeTranslations,
      hindiTranslation: wordDetails.hindiTranslation,
      updatedAt: new Date(),
    };

    // Update in MongoDB
    const result = await db.collection('words').updateOne(
      { _id: existingWord._id },
      { $set: updatedWord }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update word' }, { status: 500 });
    }

    // Store all synonyms and antonyms as separate words for quiz functionality
    await storeRelatedWords(db.collection('words'), userId, translatedMeanings);

    console.log(`✅ Successfully updated word: ${cleanWord}`);

    return NextResponse.json({ 
      success: true, 
      message: `Word "${cleanWord}" updated with proper dictionary data`,
      word: updatedWord
    });

  } catch (error) {
    console.error('Error updating word:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const fromLanguage = searchParams.get('fromLanguage');
    const toLanguage = searchParams.get('toLanguage');
    
    let query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (fromLanguage && toLanguage) {
      query.fromLanguage = fromLanguage;
      query.toLanguage = toLanguage;
    }

    const words = await db.collection('words').find(query).sort({ createdAt: -1 }).toArray();
    
    // Calculate time-based statistics
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const wordsAddedToday = words.filter(word => new Date(word.createdAt) >= now).length;
    const wordsAddedYesterday = words.filter(word => new Date(word.createdAt) >= yesterday && new Date(word.createdAt) < now).length;
    const wordsAddedLast7Days = words.filter(word => new Date(word.createdAt) >= sevenDaysAgo).length;
    const wordsAddedThisMonth = words.filter(word => new Date(word.createdAt) >= startOfMonth).length;

    return NextResponse.json({ 
      words,
      stats: {
        wordsAddedToday,
        wordsAddedYesterday,
        wordsAddedLast7Days,
        wordsAddedThisMonth,
      }
    });
  } catch (error) {
    console.error('MongoDB error, returning empty array:', error);
    
    // Fallback to localStorage
    try {
      const words = getStoredWords();
      return NextResponse.json({ 
        words, 
        fallback: true,
        stats: {
          wordsAddedToday: 0,
          wordsAddedYesterday: 0,
          wordsAddedLast7Days: 0,
          wordsAddedThisMonth: 0,
        }
      });
    } catch (fallbackError) {
      console.error('Fallback storage error:', fallbackError);
      return NextResponse.json({ 
        words: [], 
        fallback: true,
        stats: {
          wordsAddedToday: 0,
          wordsAddedYesterday: 0,
          wordsAddedLast7Days: 0,
          wordsAddedThisMonth: 0,
        }
      });
    }
  }
}