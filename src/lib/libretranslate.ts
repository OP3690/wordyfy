export interface LibreTranslateResponse {
  translatedText: string;
}

export interface MyMemoryResponse {
  responseData: {
    translatedText: string;
  };
  quotaFinished?: boolean;
  mtLimitSupported?: boolean;
  responseDetails?: string;
  responseStatus?: number;
}

// Free LibreTranslate public instances (verified working)
const LIBRETRANSLATE_INSTANCES = [
  'https://libretranslate.de',
  'https://translate.argosopentech.com'
];

export async function getLibreTranslate(word: string, sourceLang: string = 'en', targetLang: string = 'hi'): Promise<string | null> {
  // Try each free instance until one works
  for (const instance of LIBRETRANSLATE_INSTANCES) {
    try {
      console.log(`🌐 LibreTranslate (${instance}): Translating "${word}" from ${sourceLang} to ${targetLang}`);
      
      const response = await fetch(`${instance}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          q: word,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      });

      console.log(`🌐 LibreTranslate (${instance}) response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`LibreTranslate (${instance}) error: ${response.status} - ${errorText}`);
        continue; // Try next instance
      }

      const data = await response.json();
      console.log(`🌐 LibreTranslate (${instance}) response data:`, data);
      
      if (data.translatedText) {
        console.log(`🌐 LibreTranslate (${instance}) success: "${word}" → "${data.translatedText}"`);
        return data.translatedText;
      }
      
    } catch (error) {
      console.log(`LibreTranslate (${instance}) error:`, error);
      continue; // Try next instance
    }
  }
  
  console.log('All LibreTranslate instances failed');
  return null;
}

export async function getMyMemoryTranslate(word: string, sourceLang: string = 'en', targetLang: string = 'hi'): Promise<string | null> {
  try {
    console.log(`🌐 MyMemory: Translating "${word}" from ${sourceLang} to ${targetLang}`);
    
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log(`🌐 MyMemory response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MyMemory API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data: MyMemoryResponse = await response.json();
    console.log(`🌐 MyMemory response data:`, data);
    
    if (data.responseData && data.responseData.translatedText) {
      console.log(`🌐 MyMemory success: "${word}" → "${data.responseData.translatedText}"`);
      return data.responseData.translatedText;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching translation from MyMemory:', error);
    return null;
  }
}

// Simple translation dictionary for common phrases
const commonTranslations: { [key: string]: string } = {
  // Hurry examples
  "Why are you in such a big hurry?": "आप इतनी जल्दी क्यों हैं?",
  "There is no hurry on that paperwork.": "उस कागजी काम में कोई जल्दी नहीं है।",
  "Don't hurry, take your time.": "जल्दी मत करो, अपना समय लो।",
  "I'm in a hurry to catch the train.": "मुझे ट्रेन पकड़ने की जल्दी है।",
  "She hurried to finish her work.": "उसने अपना काम खत्म करने की जल्दी की।",
  
  // Happiness examples
  "She was happy to see her friend.": "वह अपने दोस्त को देखकर खुश थी।",
  "Happiness is the key to success.": "खुशी सफलता की कुंजी है।",
  "They celebrated the happy occasion together.": "उन्होंने खुश मौके को एक साथ मनाया।",
  "The children were happy playing in the garden.": "बच्चे बगीचे में खेलकर खुश थे।",
  "A happy family is a blessing.": "खुश परिवार एक आशीर्वाद है।",
  
  // Just examples
  "It is a just assessment of the facts.": "यह तथ्यों का न्यायसंगत मूल्यांकन है।",
  "The judge made a just decision.": "न्यायाधीश ने न्यायसंगत निर्णय लिया।",
  "This is just the beginning.": "यह तो सिर्फ शुरुआत है।",
  "I just arrived at the station.": "मैं अभी स्टेशन पहुंचा हूं।",
  "She was just trying to help.": "वह सिर्फ मदद करने की कोशिश कर रही थी।",
  
  // Common phrases
  "The weather is beautiful today.": "आज मौसम बहुत सुंदर है।",
  "Learning new words is fun.": "नए शब्द सीखना मजेदार है।",
  "Practice makes perfect.": "अभ्यास से पूर्णता आती है।",
  "Knowledge is power.": "ज्ञान ही शक्ति है।",
  "Time is precious.": "समय बहुमूल्य है।"
};

export async function getSimpleTranslation(word: string, sourceLang: string = 'en', targetLang: string = 'hi'): Promise<string | null> {
  try {
    console.log(`📚 Simple translation: Looking up "${word}"`);
    
    // Check if we have a direct translation
    if (commonTranslations[word]) {
      console.log(`📚 Simple translation found: "${word}" → "${commonTranslations[word]}"`);
      return commonTranslations[word];
    }
    
    // Try MyMemory as fallback
    console.log(`📚 No simple translation found, trying MyMemory...`);
    const myMemoryResult = await getMyMemoryTranslate(word, sourceLang, targetLang);
    if (myMemoryResult) {
      return myMemoryResult;
    }
    
    return null;
  } catch (error) {
    console.error('Error in simple translation:', error);
    return null;
  }
}

export async function translateWithFallback(word: string, sourceLang: string = 'en', targetLang: string = 'hi'): Promise<string | null> {
  console.log(`🔄 translateWithFallback called with: "${word}"`);
  
  // Try simple translation dictionary first (instant and reliable)
  const simpleResult = await getSimpleTranslation(word, sourceLang, targetLang);
  if (simpleResult) {
    console.log(`✅ Local dictionary success: "${word}" → "${simpleResult}"`);
    return simpleResult;
  }
  
  // Try free LibreTranslate instances (best quality when available)
  const libreResult = await getLibreTranslate(word, sourceLang, targetLang);
  if (libreResult) {
    console.log(`✅ LibreTranslate success: "${word}" → "${libreResult}"`);
    return libreResult;
  }
  
  // Fallback to MyMemory
  const myMemoryResult = await getMyMemoryTranslate(word, sourceLang, targetLang);
  if (myMemoryResult) {
    console.log(`✅ MyMemory success: "${word}" → "${myMemoryResult}"`);
    return myMemoryResult;
  }
  
  console.log(`🌐 All translation services failed for: "${word}"`);
  return null;
}
