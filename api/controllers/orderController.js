import Order from '../models/Order.js';

// Crear una nueva orden
export const createOrder = async (req, res) => {
    try {
        const { customerId, items, total } = req.body;
        const newOrder = new Order({ customerId, items, total });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la orden' });
    }
};

// Obtener una orden por ID de cliente
export const getOrderByCustomerId = async (req, res) => {
    try {
        const order = await Order.findOne({ customerId: req.params.customerId });
        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la orden' });
    }
};

// Actualizar el estado de una orden
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la orden' });
    }
};

// Obtener todas las órdenes (opcional, para administración)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
};