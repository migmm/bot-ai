import { callLLM } from '../utils/llm.js';
import { config } from '../config/constants.js';
import { getBusinessStatusWithTimeInfo } from '../utils/timeUtils.js';
import { extractDateFromQuery } from '../utils/dateUtils.js';
import * as queryHandlers from './queryHandlers.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Order from '../models/Order.js';

const chatHistory = {};

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
    const queryType = await classifyQuery(message);
    let relevantData = '';

    // Manejar la consulta según su tipo
    switch (queryType) {
        case 'ver el menú':
            relevantData = await queryHandlers.handleProductosQuery();
            break;

        case 'ver promociones':
            relevantData = await queryHandlers.handlePromocionesQuery();
            break;

        case 'consultar horarios':
            relevantData = await queryHandlers.handleHorariosQuery(queryDate, config.locales);
            break;

        case 'hacer un pedido':
            relevantData = await queryHandlers.handlePedidosQuery(message, customerId, chatHistory);
            break;

        case 'consultar información del local':
            relevantData = await queryHandlers.handleInfoQuery();
            handleOrdenesQuery
            break;

        case 'agregar_item':
            relevantData = await queryHandlers.handleAgregarItemQuery(message, customerId, chatHistory);
            break;

        case 'pedidos':
            if (
                message.toLowerCase().includes("confirmar") ||
                message.toLowerCase().includes("sí") ||
                message.toLowerCase().includes("claro") ||
                message.toLowerCase().includes("ok") ||
                message.toLowerCase().includes("listo") ||
                message.toLowerCase().includes("nada más") ||
                message.toLowerCase().includes("solo eso")
            ) {
                // Obtener el resumen del pedido
                const orderSummary = chatHistory[customerId].orderItems.map(item =>
                    `- ${item.name} (x${item.quantity})`
                ).join('\n');
                const total = chatHistory[customerId].orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

                // Guardar el pedido en la base de datos
                const newOrder = new Order({
                    customerId,
                    items: chatHistory[customerId].orderItems,
                    total,
                    status: "Pending",
                    createdAt: new Date()
                });
                await newOrder.save();

                // Limpiar el carrito
                chatHistory[customerId].orderItems = [];

                // Mostrar el mensaje final
                return {
                    response: `✅ **Pedido Confirmado** ✅\n\n${orderSummary}\n💰 *Total*: $${total}\n\nGracias por tu compra. ¡Esperamos verte pronto!`
                };
            }
            break;

        case 'consultar un pedido':
            // Si el mensaje es solo "6" o "consultar un pedido", pedir el customerId
            if (message.trim() === "6" || message.trim().toLowerCase() === "consultar un pedido") {
                return { response: "Por favor, proporciona el número de pedido (customerId) que deseas consultar." };
            }

            // Extraer el customerId del mensaje (por ejemplo, "NRMOB1")
            const customerIdToSearch = message.trim();

            // Buscar el pedido con el customerId proporcionado
            const orderDetails = await queryHandlers.handleOrdenesQuery(customerIdToSearch);

            // Devolver los detalles del pedido
            return { response: orderDetails };
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