import Chat from '../models/Chat.js';
import { callLLM } from '../utils/llm.js';
import  menu  from '../data/menu.js';
import  promos  from '../data/promos.js';
import  schedule  from '../data/schedule.js';
import Order from '../models/Order.js';
import { config } from '../config/constants.js';

const classifyQuery = async (message) => {
    const classificationPrompt = config.classificationPrompt;

    console.log("classificationPrompt", classificationPrompt)

    const response = await callLLM([
        { role: 'system', content: classificationPrompt },
        { role: 'user', content: message },
    ]);

    return response.trim().toLowerCase();
};

export const handleChat = async (message, customerId) => {
    //let chat = await Chat.findOne({ customerId }) || new Chat({ customerId, messages: [] });
    let chat = { messages: [] };
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    chat.messages.push(userMessage);

    const queryType = await classifyQuery(message);
    console.log("-----------------queryType", queryType)
    let relevantData = '';

    switch (queryType) {
        case 'horarios':
            relevantData = JSON.stringify(schedule, null, 2);
            break;
        case 'promociones':
            relevantData = JSON.stringify(promos, null, 2);
            break;
        case 'ordenes':
            const order = await Order.findOne({ customerId });
            relevantData = order ? JSON.stringify(order, null, 2) : "No se encontró ninguna orden para este cliente.";
            break;
        case 'productos':
            relevantData = JSON.stringify(menu, null, 2);
            break;
        case 'pedidos':
            relevantData = JSON.stringify({ menu, promos }, null, 2);
            break;
        default:
            relevantData = "No tengo información específica para esta consulta.";
            break;
    }

    console.log("relevantData", relevantData)

    const prompt = config.llmSystemPrompt
        .replace("{{PRODUCTOS}}", relevantData)
        .replace("{{MENSAJE}}", message);

        console.log("prompt", prompt)
    const llmResponse = await callLLM([
        { role: 'system', content: prompt },
        ...chat.messages.map((msg) => ({ role: msg.role, content: msg.content })),
    ]);

    const assistantMessage = { role: 'assistant', content: llmResponse, timestamp: new Date() };
    chat.messages.push(assistantMessage);

    await chat.save();
    return llmResponse;
};