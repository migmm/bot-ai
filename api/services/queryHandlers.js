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

/*
* handleHorariosQuery - Handles queries related to business schedules.
* @param {Date} queryDate - The date for which the schedule is requested.
* @param {Object} locales - Localization settings for formatting.
* @returns {string} - Formatted schedule information or an error message.
*/
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

/*
* handlePromocionesQuery - Handles queries related to active promotions.
* @returns {string} - Formatted promotions information or an error message.
*/
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

/*
* handleOrdenesQuery - Handles queries related to customer orders.
* @param {string} customerId - The customer's unique identifier.
* @returns {string} - Formatted order details or an error message.
*/
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

/*
* handleProductosQuery - Handles queries related to the restaurant menu.
* @returns {string} - Formatted menu information or an error message.
*/
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

/*
* handleAgregarItemQuery - Handles adding items to a customer's order.
* @param {string} message - The customer's message containing the item request.
* @param {string} customerId - The customer's unique identifier.
* @param {Object} chatHistory - The chat history for the customer.
* @returns {string} - Confirmation of item addition or an error message.
*/
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

/*
* handlePedidosQuery - Handles order confirmation and menu display.
* @param {string} message - The customer's message indicating confirmation or menu request.
* @param {string} customerId - The customer's unique identifier.
* @param {Object} chatHistory - The chat history for the customer.
* @returns {string} - Confirmation of order or the restaurant menu.
*/
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

/*
* handleInfoQuery - Handles queries related to business information.
* @returns {string} - Formatted business information or an error message.
*/
export const handleInfoQuery = async () => {
    try {
        const businessInfoFromDB = await BusinessInfo.findOne();
        return formatBusinessInfo(businessInfoFromDB);
    } catch (error) {
        console.error("Error al obtener la información del negocio:", error);
        return "Error al obtener la información del negocio. Inténtalo de nuevo más tarde.";
    }
};