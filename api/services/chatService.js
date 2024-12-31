import Chat from '../models/Chat.js';
import { callLLM } from '../utils/llm.js';
import { products } from '../config/products.js';

export const handleChat = async (message, customerId) => {
    let chat = await Chat.findOne({ customerId });
    if (!chat) {
        chat = new Chat({ customerId, messages: [] });
    }

    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    chat.messages.push(userMessage);

    const prompt = ``;

    const llmResponse = await callLLM([
        { role: 'system', content: prompt },
        ...chat.messages.map((msg) => ({ role: msg.role, content: msg.content })),
    ]);

    const assistantMessage = { role: 'assistant', content: llmResponse, timestamp: new Date() };
    chat.messages.push(assistantMessage);

    await chat.save();
    return llmResponse;
};
