import axios from 'axios';
import config from '../config/config.js';

export const callLLM = async (messages) => {
    try {
        const response = await axios.post(
            config.llmApiUrl,
            {
                model: config.llmModel,
                messages: messages
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.llmApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling LLM API:', error);
        return 'Error processing your request.';
    }
};