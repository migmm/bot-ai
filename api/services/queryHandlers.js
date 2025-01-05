import Menu from '../models/Menu.js';
import Promo from '../models/Promo.js';
import Schedule from '../models/Schedule.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Order from '../models/Order.js';
import { getBusinessStatusWithTimeInfo } from '../utils/timeUtils.js';
import { extractDateFromQuery } from '../utils/dateUtils.js';

export const handleHorariosQuery = async (queryDate, locales) => {
    try {
        const scheduleFromDB = await Schedule.find();
        return JSON.stringify(scheduleFromDB);
    } catch (error) {
        console.error("Error al obtener el horario:", error);
        return "Error al obtener el horario. Inténtalo de nuevo más tarde.";
    }
};

export const handlePromocionesQuery = async () => {
    try {
        const promosFromDB = await Promo.find();
        return JSON.stringify(promosFromDB);
    } catch (error) {
        console.error("Error al obtener las promociones:", error);
        return "Error al obtener las promociones. Inténtalo de nuevo más tarde.";
    }
};

export const handleOrdenesQuery = async (customerId) => {
    try {
        const order = await Order.findOne({ customerId });
        if (order) {
            return JSON.stringify(order);
        } else {
            return "No se encontró ninguna orden para este cliente.";
        }
    } catch (error) {
        console.error("Error al obtener la orden:", error);
        return "Error al obtener la orden. Inténtalo de nuevo más tarde.";
    }
};

export const handleProductosQuery = async () => {
    try {
        const menuFromDB = await Menu.find();
        return menuFromDB.map(item => 
            `- ${item.name}: $${item.price}\n  Descripción: ${item.description}\n`
        ).join('\n');
    } catch (error) {
        console.error("Error al obtener el menú:", error);
        return "Error al obtener el menú. Inténtalo de nuevo más tarde.";
    }
};

export const handleAgregarItemQuery = async (message, customerId, chatHistory) => {
    const menuItems = await Menu.find();
    const itemNames = menuItems.map(item => item.name.toLowerCase());

    const itemRequest = message.toLowerCase();
    const itemMatch = itemNames.find(item => itemRequest.includes(item));

    if (itemMatch) {
        const item = menuItems.find(menuItem => menuItem.name.toLowerCase() === itemMatch);
        chatHistory[customerId].orderItems.push({
            name: item.name,
            quantity: 1,
            price: item.price
        });
        return `Se agregó ${item.name} al pedido.`;
    } else {
        return "No se pudo agregar el ítem al pedido. Por favor, intenta de nuevo.";
    }
};

export const handlePedidosQuery = async (customerId, message, chatHistory) => {
    try {
        const customerHistory = chatHistory[customerId] || { orderItems: [] };

        if (message.toLowerCase().includes("confirmar") || 
            message.toLowerCase().includes("listo")) {
            
            const items = customerHistory.orderItems;

            if (items.length === 0) {
                return "No has agregado ningún ítem al pedido. Por favor, agrega ítems antes de confirmar.";
            }

            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const newOrder = new Order({
                customerId,
                items,
                total,
                status: "Pending",
                createdAt: new Date()
            });

            await newOrder.save();

            customerHistory.orderItems = [];
            chatHistory[customerId] = customerHistory;

            return `Tu pedido ha sido confirmado con éxito. Tu ID es ${newOrder._id} y el total es $${total}.`;
        }

        const menuFromDB = await Menu.find();
        const menuList = menuFromDB.map(item =>
            `- ${item.name}: $${item.price}\n  Descripción: ${item.description}\n`
        ).join('\n');

        return `Aquí está nuestro menú:\n${menuList}\n\nPuedes agregar ítems diciendo "Quiero un [nombre del ítem]".`;
    } catch (error) {
        console.error("Error en handlePedidosQuery:", error);
        return "Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo más tarde.";
    }
};

export const handleInfoQuery = async () => {
    try {
        const businessInfoFromDB = await BusinessInfo.findOne();
        return JSON.stringify(businessInfoFromDB);
    } catch (error) {
        console.error("Error al obtener la información del negocio:", error);
        return "Error al obtener la información del negocio. Inténtalo de nuevo más tarde.";
    }
};