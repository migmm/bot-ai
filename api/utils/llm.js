import axios from 'axios';
import { config } from '../config/constants.js';

export const callLLM = async (messages) => {
    try {
        const response = await axios.post(
            config.llmApiUrl,
            {
                model: config.llmModel,
                messages: messages,
                temperature: 0,
                max_tokens: 300,
            },
            {
                headers: {
                    Authorization: `Bearer ${config.llmApiKey}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling LLM API:", error);
        return "There was an error processing your request, try again later.";
    }
};