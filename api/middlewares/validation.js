import Joi from 'joi';

// Validaciones

// Business Info Schema
const businessInfoSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required()
});

// Chat Schema
const chatSchema = Joi.object({
    message: Joi.string().required(),
    customerId: Joi.string().required()
});

// Holiday Schema
const holidaySchema = Joi.object({
    date: Joi.date().iso().required(),
    name: Joi.string().required(),
    reopenDate: Joi.date().iso().greater(Joi.ref('date')).required()
});

// Menu Item Schema
const menuItemSchema = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().positive().required(),
    description: Joi.string().required(),
    pieces: Joi.number().integer().positive(),
    size: Joi.string(),
    volume: Joi.string(),
    servings: Joi.number().integer().positive()
});

// Order Schema
const orderItemSchema = Joi.object({
    name: Joi.string().required(),
    quantity: Joi.number().integer().positive().required(),
    price: Joi.number().positive().required()
});

const orderSchema = Joi.object({
    customerId: Joi.string().required(),
    items: Joi.array().items(orderItemSchema).min(1).required(),
    total: Joi.number().positive().required()
});

const orderStatusSchema = Joi.object({
    status: Joi.string().valid('Pendiente', 'En Proceso', 'Completado', 'Cancelado').required()
});

// Promo Schema
const promoSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    discount: Joi.number().min(0).max(100).required(),
    validUntil: Joi.date().iso().greater('now').required()
});

// Schedule Schema
const scheduleSchema = Joi.object({
    day: Joi.string().valid('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo').required(),
    openTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).required(),
    closeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).required(),
    isDeliveryAvailable: Joi.boolean().required()
});

// Middleware
export const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return res.status(400).json({ errors });
        }
        
        next();
    };
};

export const schemas = {
    businessInfo: businessInfoSchema,
    chat: chatSchema,
    holiday: holidaySchema,
    menuItem: menuItemSchema,
    order: orderSchema,
    orderStatus: orderStatusSchema,
    promo: promoSchema,
    schedule: scheduleSchema
};