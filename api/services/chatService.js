import { callLLM } from '../utils/llm.js';
import Menu from '../models/Menu.js';
import Promo from '../models/Promo.js';
import Schedule from '../models/Schedule.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Holiday from '../models/Holiday.js';
import Order from '../models/Order.js';
import { config } from '../config/constants.js';
import { getBusinessStatusWithTimeInfo } from '../utils/timeUtils.js';
import { extractDateFromQuery } from '../utils/dateUtils.js';

const chatHistory = {};

const classifyQuery = async (message) => {
    const classificationPrompt = config.classificationPrompt.replace('{{MESSAGE}}', message);
    const response = await callLLM([
        { role: 'system', content: classificationPrompt },
        { role: 'user', content: message },
    ]);
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
        chatHistory[customerId] = { messages: [] };
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
            try {
                const scheduleFromDB = await Schedule.find();
                relevantData = JSON.stringify(scheduleFromDB);
            } catch (error) {
                console.error("Error al obtener el horario:", error);
                relevantData = "Error al obtener el horario. Inténtalo de nuevo más tarde.";
            }
            break;

        case 'promociones':
            try {
                const promosFromDB = await Promo.find();
                relevantData = JSON.stringify(promosFromDB);
            } catch (error) {
                console.error("Error al obtener las promociones:", error);
                relevantData = "Error al obtener las promociones. Inténtalo de nuevo más tarde.";
            }
            break;

        case 'ordenes':
            try {
                const order = await Order.findOne({ customerId });
                if (order) {
                    relevantData = JSON.stringify(order);
                } else {
                    relevantData = "No se encontró ninguna orden para este cliente.";
                }
            } catch (error) {
                console.error("Error al obtener la orden:", error);
                relevantData = "Error al obtener la orden. Inténtalo de nuevo más tarde.";
            }
            break;

        case 'productos':
            try {
                const menuFromDB = await Menu.find();
                relevantData = JSON.stringify(menuFromDB);
            } catch (error) {
                console.error("Error al obtener el menú:", error);
                relevantData = "Error al obtener el menú. Inténtalo de nuevo más tarde.";
            }
            break;

        case 'info':
            try {
                const businessInfoFromDB = await BusinessInfo.findOne();
                relevantData = JSON.stringify(businessInfoFromDB);
            } catch (error) {
                console.error("Error al obtener la información del negocio:", error);
                relevantData = "Error al obtener la información del negocio. Inténtalo de nuevo más tarde.";
            }
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