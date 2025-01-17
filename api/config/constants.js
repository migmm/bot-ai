import dotenv from 'dotenv';

dotenv.config();

export const config = {
    llmApiUrl: process.env.LLM_API_URL,
    llmApiKey: process.env.LLM_API_KEY,
    llmModel: process.env.LLM_MODEL,
    llmSystemPrompt: process.env.SYSTEM_PROMPT,
    serverPort: process.env.PORT,
    mongoDbUri: process.env.MONGODB_URI,
    classificationPrompt: process.env.CLASSIFICATION_PROMPT,
    llmSystemPrompt: process.env.SYSTEM_PROMPT,
    temperature: parseFloat(process.env.TEMPERATURE),
    maxTokens: parseInt(process.env.MAX_TOKENS),
    locales: process.env.LOCALES
};

