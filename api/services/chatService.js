import { callLLM } from '../utils/llm.js';
import { config } from '../config/constants.js';
import { getBusinessStatusWithTimeInfo } from '../utils/timeUtils.js';
import { extractDateFromQuery } from '../utils/dateUtils.js';
import * as queryHandlers from './queryHandlers.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Order from '../models/Order.js';

const chatHistory = {};

const isOrderId = (message) => {
    // Validar si el mensaje es un número de pedido (por ejemplo, 6 caracteres alfanuméricos)
    return /^[A-Z0-9]{6}$/.test(message);
};

// Mapeo de números a opciones
const numberToOptionMap = {
    1: 'ver el menú',
    2: 'ver promociones',
    3: 'consultar horarios',
    4: 'hacer un pedido',
    5: 'consultar información del local',
    6: 'consultar un pedido'
};

// Función para clasificar la consulta
const classifyQuery = async (message) => {
    // Si el mensaje es un número, traducirlo a la opción correspondiente
    if (!isNaN(message)) {
        const option = numberToOptionMap[message];
        if (option) {
            return option;
        }
    }

    // Si no es un número, continuar con la clasificación normal usando el LLM
    const classificationPrompt = config.classificationPrompt.replace('{{MESSAGE}}', message);
    console.log("Prompt de clasificación:", classificationPrompt);

    const response = await callLLM([
        { role: 'system', content: classificationPrompt },
        { role: 'user', content: message },
    ]);

    console.log("Categoría devuelta por el LLM:", response.trim().toLowerCase());
    return response.trim().toLowerCase();
};

// Función principal para manejar el chat
export const handleChat = async (message, customerId) => {
    if (!customerId) {
        throw new Error("customerId is required");
    }

    if (!message || typeof message !== 'string') {
        throw new Error("message must be a non-empty string");
    }

    // Inicializar el historial de chat si no existe
    if (!chatHistory[customerId]) {
        chatHistory[customerId] = { messages: [], orderItems: [] };
    }

    const chat = chatHistory[customerId];
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    chat.messages.push(userMessage);

    // Limitar el historial de mensajes a los últimos 10
    if (chat.messages.length > 10) {
        chat.messages = chat.messages.slice(-10);
    }

    // Extraer la fecha de la consulta (si existe)
    const queryDate = extractDateFromQuery(message);

    // Obtener el estado del negocio y la información de tiempo
    const { businessStatus, timeInfo } = await getBusinessStatusWithTimeInfo(queryDate, config.locales);

    // Clasificar la consulta del usuario
    let queryType;

    // Validar si el mensaje es un número de pedido
    if (isOrderId(message)) {
        queryType = 'consultar un pedido';
    } else {
        // Si no es un número de pedido, clasificar la consulta usando el LLM
        queryType = await classifyQuery(message);
    }

    let relevantData = '';

    // Manejar la consulta según su tipo
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
            // Si el mensaje es solo "6" o "consultar un pedido", pedir el customerId
            if (message.trim() === "6" || message.trim().toLowerCase() === "consultar un pedido") {
                return { response: "Por favor, proporciona el número de pedido que deseas consultar." };
            }

            // Extraer el customerId del mensaje (por ejemplo, "HAGUXF")
            const customerIdToSearch = message.trim();

            // Buscar el pedido con el customerId proporcionado
            const orderDetails = await queryHandlers.handleOrdenesQuery(customerIdToSearch);

            if (orderDetails.includes("No se encontraron pedidos")) {
                return { response: "No se encontró ningún pedido con ese número. Por favor, verifica el número e inténtalo de nuevo." };
            }

            // Devolver los detalles del pedido
            return { response: orderDetails };

        case 'info':
            relevantData = await queryHandlers.handleInfoQuery();
            break;

        default:
            relevantData = "";
            break;
    }

    // Obtener la información del negocio desde la base de datos
    const businessInfoFromDB = await BusinessInfo.findOne();

    // Construir el prompt final para el LLM
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

    // Preparar los mensajes para el LLM
    const messages = [
        { role: 'system', content: finalSystemPrompt },
        ...chat.messages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    // Llamar al LLM para obtener la respuesta
    const llmResponse = await callLLM(messages);

    // Guardar la respuesta del asistente en el historial de chat
    const assistantMessage = { role: 'assistant', content: llmResponse, timestamp: new Date() };
    chat.messages.push(assistantMessage);

    // Devolver la respuesta al cliente
    return { response: llmResponse };
};