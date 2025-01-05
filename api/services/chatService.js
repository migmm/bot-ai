import { callLLM } from '../utils/llm.js';
import Menu from '../models/Menu.js';
import Promo from '../models/Promo.js';
import Schedule from '../models/Schedule.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Order from '../models/Order.js';
import { config } from '../config/constants.js';
import { getBusinessStatusWithTimeInfo } from '../utils/timeUtils.js';
import { extractDateFromQuery } from '../utils/dateUtils.js';

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

const addItemToOrder = async (message, customerId) => {
    const menuItems = await Menu.find();
    const itemNames = menuItems.map(item => item.name.toLowerCase());

    const itemRequest = message.toLowerCase();
    const itemMatch = itemNames.find(item => itemRequest.includes(item));

    if (itemMatch) {
        const item = menuItems.find(menuItem => menuItem.name.toLowerCase() === itemMatch);
        console.log("Ítem encontrado:", item);
        return {
            name: item.name,
            quantity: 1,
            price: item.price
        };
    }

    console.log("No se encontró ningún ítem en el mensaje:", message);
    return null;
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
                console.log("Menú obtenido de la base de datos:", menuFromDB);
                relevantData = menuFromDB.map(item => 
                    `- ${item.name}: $${item.price}\n  Descripción: ${item.description}\n`
                ).join('\n');
                console.log("Menú formateado:", relevantData);
            } catch (error) {
                console.error("Error al obtener el menú:", error);
                relevantData = "Error al obtener el menú. Inténtalo de nuevo más tarde.";
            }
            break;

        case 'agregar_item':
            // Lógica para agregar ítems al carrito
            const item = await addItemToOrder(message, customerId);
            if (item) {
                chat.orderItems.push(item);
                relevantData = `Se agregó ${item.name} al pedido.`;
            } else {
                relevantData = "No se pudo agregar el ítem al pedido. Por favor, intenta de nuevo.";
            }
            break;

        case 'pedidos':
            // Lógica para manejar pedidos
            if (message.toLowerCase().includes("confirmar") || message.toLowerCase().includes("sí") || message.toLowerCase().includes("claro") || message.toLowerCase().includes("ok")) {
                // Confirmar el pedido
                try {
                    if (chat.orderItems.length === 0) {
                        const errorMessage = "No has agregado ningún ítem al pedido. Por favor, agrega ítems antes de confirmar.";
                        const assistantMessage = { role: 'assistant', content: errorMessage, timestamp: new Date() };
                        chat.messages.push(assistantMessage);
                        return errorMessage;
                    }

                    const items = chat.orderItems;
                    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

                    const newOrder = new Order({
                        customerId,
                        items,
                        total,
                        status: "Pending",
                        createdAt: new Date()
                    });

                    await newOrder.save();

                    chat.orderItems = [];

                    const confirmationMessage = `Pedido confirmado, tu ID es ${newOrder._id} y el precio es $${total}.`;
                    const assistantMessage = { role: 'assistant', content: confirmationMessage, timestamp: new Date() };
                    chat.messages.push(assistantMessage);

                    return confirmationMessage;
                } catch (error) {
                    console.error("Error al crear el pedido:", error);
                    const errorMessage = "Error al crear el pedido. Inténtalo de nuevo más tarde.";
                    const assistantMessage = { role: 'assistant', content: errorMessage, timestamp: new Date() };
                    chat.messages.push(assistantMessage);

                    return errorMessage;
                }
            } else {
                // Si no es una confirmación, ofrecer el menú y permitir agregar ítems
                const menuFromDB = await Menu.find();
                relevantData = menuFromDB.map(item =>
                    `- ${item.name}: $${item.price}\n  Descripción: ${item.description}\n`
                ).join('\n');

                const assistantMessage = { role: 'assistant', content: `Aquí está nuestro menú:\n${relevantData}\n\nPuedes agregar ítems diciendo "Quiero un [nombre del ítem]".`, timestamp: new Date() };
                chat.messages.push(assistantMessage);

                return `Aquí está nuestro menú:\n${relevantData}\n\nPuedes agregar ítems diciendo "Quiero un [nombre del ítem]".`;
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

    // Resto de la lógica para manejar la respuesta del LLM
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