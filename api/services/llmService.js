import axios from 'axios';
import config from '../config/config.js';

export const callLLM = async (messages) => {
    try {
        const response = await axios.post(
            config.llmApiUrl,
            {
                model: config.llmModel,
                messages: messages,
                temperature: 0.1,
                max_tokens: 100,
            },
            {
                headers: {
                    Authorization: `Bearer ${config.llmApiKey}`,
                },
            }
        );

        const llmResponse = response.data.choices[0].message.content;

        try {
            return JSON.parse(llmResponse);
        } catch (e) {
            console.error("Unstructured LLM response:", llmResponse);
            return { intentType: "unknown" };
        }
    } catch (error) {
        console.error("Error calling LLM API:", error);
        return { intentType: "unknown" };
    }
};


