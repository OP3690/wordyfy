# Google Cloud Translation API v3 Setup

This application now supports both Google Cloud Translation API v3 (recommended) and v2 (fallback) for enhanced translation capabilities.

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Google Cloud Translation API Configuration
GOOGLE_TRANSLATE_API_KEY=your-api-key-here
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# MongoDB Configuration  
MONGODB_URI=your-mongodb-connection-string

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Google Cloud Translation API v3 Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

### 2. Enable Translation API
1. Go to "APIs & Services" > "Library"
2. Search for "Cloud Translation API"
3. Click "Enable"

### 3. Create API Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Optional) Restrict the API key to Translation API only

### 4. Set Environment Variables
Update your `.env.local` file with:
```bash
GOOGLE_TRANSLATE_API_KEY=your-generated-api-key
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

## API Features

### Translation API v3 Benefits
- **Better Accuracy**: Improved translation quality
- **Language Detection**: Automatic language detection
- **Supported Languages**: Get list of supported languages
- **Batch Translation**: Translate multiple texts at once
- **Document Translation**: Translate entire documents
- **Glossary Support**: Custom translation glossaries

### Fallback Support
The application automatically falls back to v2 API if v3 fails, ensuring compatibility.

## API Endpoints Used

### v3 API Endpoints
- `POST /v3/projects/{project-id}:translateText` - Translate text
- `POST /v3/projects/{project-id}:detectLanguage` - Detect language
- `GET /v3/projects/{project-id}/supportedLanguages` - Get supported languages

### v2 API Endpoints (Fallback)
- `POST /language/translate/v2` - Translate text

## Usage Examples

```typescript
import { translateToHindi, detectLanguage, getSupportedLanguages } from '@/lib/translate';

// Translate text
const hindiText = await translateToHindi("Hello world");

// Detect language
const language = await detectLanguage("Hola mundo");

// Get supported languages
const languages = await getSupportedLanguages();
```

## Troubleshooting

### Common Issues
1. **Authentication Error**: Check your API key and project ID
2. **Quota Exceeded**: Check your Google Cloud billing and quotas
3. **Permission Denied**: Ensure Translation API is enabled for your project

### API Limits
- Free tier: 500,000 characters per month
- Paid tier: Higher limits available
- Rate limits: 100 requests per 100 seconds per user

## Security Best Practices
1. Never commit API keys to version control
2. Use environment variables for all secrets
3. Restrict API keys to specific APIs and IPs
4. Regularly rotate API keys
5. Monitor API usage in Google Cloud Console
