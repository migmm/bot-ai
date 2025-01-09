import { callLLM } from '../utils/llm.js';
import { config } from '../config/constants.js';
import { getBusinessStatusWithTimeInfo } from '../utils/timeUtils.js';
import { extractDateFromQuery } from '../utils/dateUtils.js';
import * as queryHandlers from './queryHandlers.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Order from '../models/Order.js';

/*
* chatHistory - Object to store chat history for each customer.
* Structure: { customerId: { messages: [], orderItems: [] } }
*/
const chatHistory = {};

/*
* isOrderId - Validates if a message is an order ID.
* @param {string} message - The message to validate.
* @returns {boolean} - True if the message is a valid order ID, false otherwise.
*/
const isOrderId = (message) => {
    return /^[A-Z0-9]{6}$/.test(message);
};

/*
* numberToOptionMap - Mapping of numbers to predefined query options.
* Used to translate numeric inputs into specific query types.
*/
const numberToOptionMap = {
    1: 'ver el menú',
    2: 'ver promociones',
    3: 'consultar horarios',
    4: 'hacer un pedido',
    5: 'consultar información del local',
    6: 'consultar un pedido'
};

/*
* classifyQuery - Classifies a customer query using the LLM or predefined mappings.
* @param {string} message - The customer's message.
* @returns {string} - The classified query type.
*/
const classifyQuery = async (message) => {
    // If the message is a number, translate it to the corresponding option.
    if (!isNaN(message)) {
        const option = numberToOptionMap[message];
        if (option) {
            return option;
        }
    }

    // If not a number, classify the query using the LLM.
    const classificationPrompt = config.classificationPrompt.replace('{{MESSAGE}}', message);
    console.log("Prompt de clasificación:", classificationPrompt);

    const response = await callLLM([
        { role: 'system', content: classificationPrompt },
        { role: 'user', content: message },
    ]);

    console.log("Categoría devuelta por el LLM:", response.trim().toLowerCase());
    return response.trim().toLowerCase();
};

/*
* handleChat - Main function to process customer messages and generate responses.
* @param {string} message - The customer's message.
* @param {string} customerId - The unique identifier for the customer.
* @returns {Object} - The response object containing the LLM's reply.
* @throws {Error} - If customerId is missing or the message is invalid.
*/
export const handleChat = async (message, customerId) => {
    if (!customerId) {
        throw new Error("customerId is required");
    }

    if (!message || typeof message !== 'string') {
        throw new Error("message must be a non-empty string");
    }

    // Initialize chat history if it doesn't exist for the customer.
    if (!chatHistory[customerId]) {
        chatHistory[customerId] = { messages: [], orderItems: [] };
    }

    const chat = chatHistory[customerId];
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    chat.messages.push(userMessage);

    // Limit chat history to the last 10 messages.
    if (chat.messages.length > 10) {
        chat.messages = chat.messages.slice(-10);
    }

    // Extract date from the query if present.
    const queryDate = extractDateFromQuery(message);

    // Get business status and time information.
    const { businessStatus, timeInfo } = await getBusinessStatusWithTimeInfo(queryDate, config.locales);

    // Classify the customer's query.
    let queryType;

    // Check if the message is an order ID.
    if (isOrderId(message)) {
        queryType = 'consultar un pedido';
    } else {
        // If not, classify the query using the LLM.
        queryType = await classifyQuery(message);
    }

    let relevantData = '';

    // Handle the query based on its type.
    switch (queryType) {
        case 'ver el menú':
            relevantData = await queryHandlers.handleProductosQuery();
            break;

        case 'agregar_item':
            relevantData = await queryHandlers.handleAgregarItemQuery(message, customerId, chatHistory);
            break;

        case 'confirmar_pedido':
            relevantData = await queryHandlers.handlePedidosQuery(message, customerId, chatHistory);
            break;

        case 'ver promociones':
            relevantData = await queryHandlers.handlePromocionesQuery();
            break;

        case 'consultar horarios':
            relevantData = await queryHandlers.handleHorariosQuery(queryDate, config.locales);
            break;

        case 'consultar un pedido':
            // If the message is just "6" or "consultar un pedido", ask for the order ID.
            if (message.trim() === "6" || message.trim().toLowerCase() === "consultar un pedido") {
                return { response: "Por favor, proporciona el número de pedido que deseas consultar." };
            }

            // Extract the order ID from the message.
            const customerIdToSearch = message.trim();

            // Search for the order with the provided ID.
            const orderDetails = await queryHandlers.handleOrdenesQuery(customerIdToSearch);

            if (orderDetails.includes("No se encontraron pedidos")) {
                return { response: "No se encontró ningún pedido con ese número. Por favor, verifica el número e inténtalo de nuevo." };
            }

            // Return the order details.
            return { response: orderDetails };

        case 'info':
            relevantData = await queryHandlers.handleInfoQuery();
            break;

        default:
            relevantData = "";
            break;
    }

    // Retrieve business information from the database.
    const businessInfoFromDB = await BusinessInfo.findOne();

    // Construct the final prompt for the LLM.
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

    // Prepare messages for the LLM.
    const messages = [
        { role: 'system', content: finalSystemPrompt },
        ...chat.messages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    // Call the LLM to generate a response.
    const llmResponse = await callLLM(messages);

    // Save the assistant's response in the chat history.
    const assistantMessage = { role: 'assistant', content: llmResponse, timestamp: new Date() };
    chat.messages.push(assistantMessage);

    // Return the response to the customer.
    return { response: llmResponse };
};