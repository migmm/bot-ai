import { callLLM } from '../utils/llm.js';
import menu from '../data/menu.js';
import promos from '../data/promos.js';
import schedule from '../data/schedule.js';
import Order from '../models/Order.js';
import businessInfo from '../data/businessInfo.js';
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

const groupScheduleByHours = (schedule) => {
    const grouped = [];
    let currentGroup = null;

    schedule.forEach(day => {
        const hoursKey = `${day.openTime}-${day.closeTime}`;
        if (!currentGroup || currentGroup.hoursKey !== hoursKey) {
            currentGroup = {
                days: [day.day],
                hoursKey,
                openTime: day.openTime,
                closeTime: day.closeTime
            };
            grouped.push(currentGroup);
        } else {
            currentGroup.days.push(day.day);
        }
    });

    return grouped;
};

const formatGroupedSchedule = (groupedSchedule) => {
    return groupedSchedule.map(group => {
        if (group.days.length === 1) {
            return `${group.days[0]}: ${group.openTime} - ${group.closeTime}`;
        } else {
            const firstDay = group.days[0];
            const lastDay = group.days[group.days.length - 1];
            return `${firstDay} a ${lastDay}: ${group.openTime} - ${group.closeTime}`;
        }
    }).join('\n');
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
            relevantData = JSON.stringify({
                schedule,
                businessStatus,
                timeInfo,
                queryDate: queryDate ? queryDate.toISOString() : null
            }, null, 2);
            break;
        case 'promociones':
            relevantData = JSON.stringify(promos, null, 2);
            break;
        case 'ordenes':
            const order = await Order.findOne({ customerId });
            if (order) {
                relevantData = JSON.stringify({
                    status: order.status,
                    items: order.items,
                    total: order.total
                }, null, 2);
            } else {
                relevantData = "No se encontró ninguna orden para este cliente.";
            }
            break;
        case 'productos':
            relevantData = JSON.stringify(menu, null, 2);
            break;
        case 'pedidos':
            relevantData = JSON.stringify({ menu, promos }, null, 2);
            break;
        case 'info':
            relevantData = JSON.stringify(businessInfo, null, 2);
            break;
        default:
            relevantData = "";
            break;
    }

    const groupedSchedule = groupScheduleByHours(schedule);
    const scheduleMessage = formatGroupedSchedule(groupedSchedule);

    let finalSystemPrompt = config.llmSystemPrompt
        .replace('{{SCHEDULE_MESSAGE}}', scheduleMessage)
        .replace('{{BUSINESS_INFO}}', JSON.stringify(businessInfo, null, 2))
        .replace('{{BUSINESS_NAME}}', businessInfo.name);

    if (!businessStatus.isOpen) {
        finalSystemPrompt += ` ${businessStatus.status}`;
    } else {
        finalSystemPrompt += ` ¡Abierto! ${businessStatus.status}`;
    }

    // Add relevant data to the system prompt
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