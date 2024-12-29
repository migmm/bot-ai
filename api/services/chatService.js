import Chat from '../models/Chat.js';
import { callLLM } from './llmService.js';
import { getSystemPrompt } from '../utils/systemPrompt.js';

export const handleChat = async (message, customerId) => {
    const chatHistory = await Chat.find({ customerId }).sort({ timestamp: 1 });

    const context = {
        message,
        customerId,
        chatHistory
    };

    const llmResponse = await callLLM(createMessages(context));

    await Chat.create({
        customerId,
        message,
        response: llmResponse,
        consultationNumber: await generateConsultationNumber(customerId)
    });

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

const generateConsultationNumber = async (customerId) => {
    const count = await Chat.countDocuments({ customerId });
    return `${customerId}-${count + 1}`;
};