import Menu from '../models/Menu.js';
import Promo from '../models/Promo.js';
import Schedule from '../models/Schedule.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Order from '../models/Order.js';
import { 
    formatSchedule, 
    formatPromos, 
    formatOrders, 
    formatMenu, 
    formatBusinessInfo, 
    formatConfirmedOrder 
} from '../utils/formatters.js';

export const handleHorariosQuery = async (queryDate, locales) => {
    try {
        const scheduleFromDB = await Schedule.find();
        const formattedSchedule = formatSchedule(scheduleFromDB);

        return `📅 **Nuestros Horarios** 📅\n\n${formattedSchedule}\n\n¿Te gustaría hacer un pedido para hoy? (Sí/No)`;
    } catch (error) {
        console.error("Error al obtener el horario:", error);
        return "Error al obtener el horario. Inténtalo de nuevo más tarde.";
    }
};

export const handlePromocionesQuery = async () => {
    try {
        const promosFromDB = await Promo.find();
        const promosFormatted = formatPromos(promosFromDB);

        return `🎊 **Promociones Activas** 🎊\n\n${promosFormatted}`;
    } catch (error) {
        console.error("Error al obtener las promociones:", error);
        return "Error al obtener las promociones. Inténtalo de nuevo más tarde.";
    }
};

export const handleOrdenesQuery = async (customerId) => {
    try {
        const orders = await Order.find({ customerId });

        if (orders.length === 0) {
            return "No se encontraron pedidos para este número de pedido.";
        }

        const formattedOrders = formatOrders(orders);
        return formattedOrders;
    } catch (error) {
        console.error("Error al obtener las órdenes:", error);
        return "Error al obtener las órdenes. Inténtalo de nuevo más tarde.";
    }
};

export const handleProductosQuery = async () => {
    try {
        const menuFromDB = await Menu.find();
        const menuFormatted = formatMenu(menuFromDB);

        return `🍱 **Menú del Restaurante** 🍱\n\n${menuFormatted}`;
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

export const handlePedidosQuery = async (message, customerId, chatHistory) => {
    if (message.toLowerCase().includes("confirmar") || message.toLowerCase().includes("listo") || message.toLowerCase().includes("sí") || message.toLowerCase().includes("si") || message.toLowerCase().includes("ok")) {
        try {
            const items = chatHistory[customerId].orderItems;

            if (items.length === 0) {
                return "No has agregado ningún ítem al pedido. Por favor, agrega ítems antes de confirmar.";
            }

            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const newOrder = new Order({
                customerId,
                items,
                total,
                status: "En preparación",
                createdAt: new Date()
            });

            await newOrder.save();

            chatHistory[customerId].orderItems = [];

            return formatConfirmedOrder(newOrder, total);
        } catch (error) {
            console.error("Error al crear el pedido:", error);
            return "Hubo un problema al confirmar tu pedido. Por favor, inténtalo de nuevo más tarde.";
        }
    } else {
        const menuFromDB = await Menu.find();
        const menuList = formatMenu(menuFromDB);

        return `🍱 **Menú del Restaurante** 🍱\n\n${menuList}\n\nPuedes agregar ítems diciendo "Quiero un [nombre del ítem]".`;
    }
};

export const handleInfoQuery = async () => {
    try {
        const businessInfoFromDB = await BusinessInfo.findOne();
        return formatBusinessInfo(businessInfoFromDB);
    } catch (error) {
        console.error("Error al obtener la información del negocio:", error);
        return "Error al obtener la información del negocio. Inténtalo de nuevo más tarde.";
    }
};