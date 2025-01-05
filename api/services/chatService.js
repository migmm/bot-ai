import { callLLM } from '../utils/llm.js';
import { config } from '../config/constants.js';
import { getBusinessStatusWithTimeInfo } from '../utils/timeUtils.js';
import { extractDateFromQuery } from '../utils/dateUtils.js';
import * as queryHandlers from './queryHandlers.js';
import BusinessInfo from '../models/BusinessInfo.js';

const chatHistory = {};

const classifyQuery = async (message) => {
    const classificationPrompt = config.classificationPrompt.replace('{{MESSAGE}}', message);
    console.log("Prompt de clasificación:", classificationPrompt);

    const response = await callLLM([
        { role: 'system', content: classificationPrompt },
        { role: 'user', content: message },
    ]);

    console.log("Categoría devuelta por el LLM:", response.trim().toLowerCase());
    return response.trim().toLowerCase();
};

export const handleChat = async (message, customerId) => {
    if (!customerId) {
        throw new Error("customerId is required");
    }

    if (!message || typeof message !== 'string') {
        throw new Error("message must be a non-empty string");
    }

    if (!chatHistory[customerId]) {
        chatHistory[customerId] = { messages: [], orderItems: [] };
    }

    const chat = chatHistory[customerId];
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    chat.messages.push(userMessage);

    if (chat.messages.length > 10) {
        chat.messages = chat.messages.slice(-10);
    }

    const queryDate = extractDateFromQuery(message);
    const { businessStatus, timeInfo } = getBusinessStatusWithTimeInfo(queryDate, config.locales);

    const queryType = await classifyQuery(message);
    let relevantData = '';

    switch (queryType) {
        case 'horarios':
            relevantData = await queryHandlers.handleHorariosQuery(queryDate, config.locales);
            break;

        case 'promociones':
            relevantData = await queryHandlers.handlePromocionesQuery();
            break;

        case 'ordenes':
            relevantData = await queryHandlers.handleOrdenesQuery(customerId);
            break;

        case 'productos':
            relevantData = await queryHandlers.handleProductosQuery();
            break;

        case 'agregar_item':
            relevantData = await queryHandlers.handleAgregarItemQuery(message, customerId, chatHistory);
            break;

        case 'pedidos':
            relevantData = await queryHandlers.handlePedidosQuery(customerId, message, chatHistory);
            break;

        case 'info':
            relevantData = await queryHandlers.handleInfoQuery();
            break;

        default:
            relevantData = "";
            break;
    }

    const businessInfoFromDB = await BusinessInfo.findOne();

    let finalSystemPrompt = config.llmSystemPrompt
        .replace('{{BUSINESS_NAME}}', businessInfoFromDB.name)
        .replace('{{BUSINESS_INFO}}', JSON.stringify(businessInfoFromDB));

    if (!businessStatus.isOpen) {
        finalSystemPrompt += ` ${businessStatus.status}`;
    } else {
        finalSystemPrompt += ` ¡Abierto! ${businessStatus.status}`;
    }

    if (relevantData) {
        finalSystemPrompt += `\n\nInformación relevante:\n${relevantData}`;
    }

    finalSystemPrompt += ` El cliente dijo: "${message}"`;

    const messages = [
        { role: 'system', content: finalSystemPrompt },
        ...chat.messages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    const llmResponse = await callLLM(messages);

    const assistantMessage = { role: 'assistant', content: llmResponse, timestamp: new Date() };
    chat.messages.push(assistantMessage);

    return llmResponse;
};