import Menu from '../models/Menu.js';
import Promo from '../models/Promo.js';
import Schedule from '../models/Schedule.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Order from '../models/Order.js';
import { config } from '../config/constants.js';

export const handleHorariosQuery = async (queryDate, locales) => {
    try {
        const scheduleFromDB = await Schedule.find();
        const formattedSchedule = scheduleFromDB.map(schedule => {
            return `⏰ **${schedule.day}**: ${schedule.openTime} - ${schedule.closeTime}`;
        }).join('\n');

        return `📅 **Nuestros Horarios** 📅\n\n${formattedSchedule}\n\n¿Te gustaría hacer un pedido para hoy? (Sí/No)`;
    } catch (error) {
        console.error("Error al obtener el horario:", error);
        return "Error al obtener el horario. Inténtalo de nuevo más tarde.";
    }
};
export const handlePromocionesQuery = async () => {
    try {
        const promosFromDB = await Promo.find();
        const promosFormatted = promosFromDB.map(promo => {
            return `🎉 **${promo.title}**: ${promo.description}\n🤑 *Descuento*: ${promo.discount}%\n📅 *Válido hasta*: ${new Date(promo.validUntil).toLocaleDateString(config.locales)}\n`;
        }).join('\n');

        return `🎊 **Promociones Activas** 🎊\n\n${promosFormatted}`;
    } catch (error) {
        console.error("Error al obtener las promociones:", error);
        return "Error al obtener las promociones. Inténtalo de nuevo más tarde.";
    }
};

export const handleOrdenesQuery = async (customerId) => {
    try {
        // Buscar todos los pedidos asociados al customerId
        const orders = await Order.find({ customerId });

        if (orders.length === 0) {
            return "No se encontraron pedidos para este número de pedido.";
        }

        // Formatear la información de los pedidos
        const formattedOrders = orders.map((order, index) => {
            return `📦 **Tu Pedido**\n` +
                   `🆔 **ID del Pedido**: ${order.customerId}\n` +
                   `🛒 **Ítems**:\n${order.items.map(item => `   - ${item.name} (x${item.quantity})`).join('\n')}\n` +
                   `💰 **Total**: $${order.total}\n` +
                   `📅 **Fecha**: ${new Date(order.createdAt).toLocaleDateString(config.locales)}\n` +
                   `📝 **Estado**: ${order.status}\n`;
        }).join('\n');

        return formattedOrders;
    } catch (error) {
        console.error("Error al obtener las órdenes:", error);
        return "Error al obtener las órdenes. Inténtalo de nuevo más tarde.";
    }
};
export const handleProductosQuery = async () => {
    try {
        const menuFromDB = await Menu.find();
        const menuFormatted = menuFromDB.map(item => {
            let emoji = '🍣'; // Emoji por defecto para sushi
            if (item.category === 'soups') emoji = '🍜';
            if (item.category === 'sauces') emoji = '🥫';
            if (item.category === 'drinks') emoji = '🍶';
            if (item.category === 'desserts') emoji = '🍨';

            return `${emoji} **${item.name}**: $${item.price}\n🥢 *Descripción*: ${item.description}\n🍴 *Piezas*: ${item.pieces || 'N/A'}\n📏 *Tamaño*: ${item.size || 'N/A'}\n🥤 *Volumen*: ${item.volume || 'N/A'}\n🍽️ *Porciones*: ${item.servings || 'N/A'}\n`;
        }).join('\n');

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
    if (message.toLowerCase().includes("confirmar") || message.toLowerCase().includes("listo")) {
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
                status: "Pending",
                createdAt: new Date()
            });

            await newOrder.save();

            chatHistory[customerId].orderItems = [];

            return `✅ **Pedido Confirmado** ✅\n\n🆔 *ID del Pedido*: ${newOrder._id}\n💰 *Total*: $${total}\n📅 *Fecha*: ${new Date(newOrder.createdAt).toLocaleDateString(config.locales)}\n\nGracias por tu compra. ¡Esperamos verte pronto!`;
        } catch (error) {
            console.error("Error al crear el pedido:", error);
            return "Hubo un problema al confirmar tu pedido. Por favor, inténtalo de nuevo más tarde.";
        }
    } else {
        const menuFromDB = await Menu.find();
        const menuList = menuFromDB.map(item =>
            `🍣 **${item.name}**: $${item.price}\n🥢 *Descripción*: ${item.description}\n🍴 *Piezas*: ${item.pieces || 'N/A'}\n📏 *Tamaño*: ${item.size || 'N/A'}\n🥤 *Volumen*: ${item.volume || 'N/A'}\n🍽️ *Porciones*: ${item.servings || 'N/A'}\n`
        ).join('\n');

        return `🍱 **Menú del Restaurante** 🍱\n\n${menuList}\n\nPuedes agregar ítems diciendo "Quiero un [nombre del ítem]".`;
    }
};

export const handleInfoQuery = async () => {
    try {
        const businessInfoFromDB = await BusinessInfo.findOne();
        return `🏢 **Información del Local** 🏢\n\n📍 *Dirección*: ${businessInfoFromDB.address}, ${businessInfoFromDB.city}, ${businessInfoFromDB.state}\n📞 *Teléfono*: ${businessInfoFromDB.phone}\n📧 *Email*: ${businessInfoFromDB.email}`;
    } catch (error) {
        console.error("Error al obtener la información del negocio:", error);
        return "Error al obtener la información del negocio. Inténtalo de nuevo más tarde.";
    }
};
