export interface DictionaryResponse {
  word: string;
  phonetics: {
    text: string;
    audio?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
    synonyms?: string[];
    antonyms?: string[];
  }[];
  license: {
    name: string;
    url: string;
  };
  sourceUrls: string[];
}

export async function getWordDetails(word: string): Promise<DictionaryResponse | null> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      console.error(`Dictionary API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // The API returns an array, so we take the first entry
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching word details from Dictionary API:', error);
    return null;
  }
}

export function extractEnhancedWordData(dictionaryData: DictionaryResponse, translation: string) {
  // Extract the first phonetic with audio if available
  const phonetic = dictionaryData.phonetics?.find(p => p.audio) || dictionaryData.phonetics?.[0];
  
  // Extract the first meaning with definitions
  const firstMeaning = dictionaryData.meanings?.[0];
  
  // Get the first definition with example
  const firstDefinition = firstMeaning?.definitions?.[0];
  
  return {
    phonetics: dictionaryData.phonetics,
    meanings: dictionaryData.meanings,
    pronunciation: phonetic?.text,
    audioUrl: phonetic?.audio,
    partOfSpeech: firstMeaning?.partOfSpeech,
    definition: firstDefinition?.definition,
    example: firstDefinition?.example,
    synonyms: firstDefinition?.synonyms || firstMeaning?.synonyms || [],
    antonyms: firstDefinition?.antonyms || firstMeaning?.antonyms || []
  };
}
