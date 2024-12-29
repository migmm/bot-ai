import Chat from '../models/Chat.js';
import { callLLM } from './llmService.js';
import { getSystemPrompt } from '../utils/systemPrompt.js';

export const handleChat = async (message, customerId) => {
    let chat = await Chat.findOne({ customerId });

    if (!chat) {
        chat = new Chat({ customerId, messages: [] });
    }

    const context = {
        message,
        customerId,
        chatHistory: chat.messages
    };

    const llmResponse = await callLLM(createMessages(context));

    chat.messages.push({
        message,
        response: llmResponse
    });

    chat.lastActivity = new Date();
    await chat.save();

    return llmResponse;
};
const createMessages = (context) => {
    const systemPrompt = getSystemPrompt();

    const updatedSystemPrompt = systemPrompt
        .replace(/{price}/g, "the requested price")
        .replace(/{product}/g, "the requested product")
        .replace(/{total}/g, "the calculated total");

    const messages = [{
        role: 'system',
        content: updatedSystemPrompt
    }];

    context.chatHistory.forEach(chat => {
        messages.push({ role: 'user', content: chat.message });
        messages.push({ role: 'assistant', content: chat.response });
    });

    messages.push({ role: 'user', content: context.message });

    return messages;
};