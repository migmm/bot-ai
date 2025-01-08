import { config } from '../config/constants.js';

export const formatSchedule = (scheduleFromDB) => {
    return scheduleFromDB.map(schedule => {
        return `⏰ **${schedule.day}**: ${schedule.openTime} - ${schedule.closeTime}`;
    }).join('\n');
};

export const formatPromos = (promosFromDB) => {
    return promosFromDB.map(promo => {
        return `🎉 **${promo.title}**: ${promo.description}\n🤑 *Descuento*: ${promo.discount}%\n📅 *Válido hasta*: ${new Date(promo.validUntil).toLocaleDateString(config.locales)}\n`;
    }).join('\n');
};

export const formatOrders = (orders) => {
    return orders.map((order, index) => {
        return `📦 **Tu Pedido**\n` +
               `🆔 **ID del Pedido**: ${order.customerId}\n` +
               `🛒 **Ítems**:\n${order.items.map(item => `   - ${item.name} (x${item.quantity})`).join('\n')}\n` +
               `💰 **Total**: $${order.total}\n` +
               `📅 **Fecha**: ${new Date(order.createdAt).toLocaleDateString(config.locales)}\n` +
               `📝 **Estado**: ${order.status}\n`;
    }).join('\n');
};

export const formatMenu = (menuFromDB) => {
    return menuFromDB.map(item => {
        let emoji = '🍣'; // Emoji por defecto para sushi
        if (item.category === 'soups') emoji = '🍜';
        if (item.category === 'sauces') emoji = '🥫';
        if (item.category === 'drinks') emoji = '🍶';
        if (item.category === 'desserts') emoji = '🍨';

        return `${emoji} **${item.name}**: $${item.price}\n🥢 *Descripción*: ${item.description}\n🍴 *Piezas*: ${item.pieces || 'N/A'}\n📏 *Tamaño*: ${item.size || 'N/A'}\n🥤 *Volumen*: ${item.volume || 'N/A'}\n🍽️ *Porciones*: ${item.servings || 'N/A'}\n`;
    }).join('\n');
};

export const formatBusinessInfo = (businessInfoFromDB) => {
    return `🏢 **Información del Local** 🏢\n\n` +
           `📍 *Dirección*: ${businessInfoFromDB.address}, ${businessInfoFromDB.city}, ${businessInfoFromDB.state}\n` +
           `📞 *Teléfono*: ${businessInfoFromDB.phone}\n` +
           `📧 *Email*: ${businessInfoFromDB.email}`;
};

export const formatConfirmedOrder = (newOrder, total) => {
    return `✅ **Pedido Confirmado** ✅\n\n` +
           `🆔 *ID del Pedido*: ${newOrder._id}\n` +
           `💰 *Total*: $${total}\n` +
           `📅 *Fecha*: ${new Date(newOrder.createdAt).toLocaleDateString(config.locales)}\n\n` +
           `Gracias por tu compra. ¡Esperamos verte pronto!`;
};