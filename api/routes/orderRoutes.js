import express from 'express';
import {
    createOrder,
    getOrderByCustomerId,
    updateOrderStatus,
    getAllOrders
} from '../controllers/orderController.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

// Crear una nueva orden
router.post('/orders', validate(schemas.order), createOrder);

// Obtener una orden por ID de cliente
router.get('/orders/:customerId', getOrderByCustomerId);

// Actualizar el estado de una orden
router.put('/orders/:id', validate(schemas.orderStatus), updateOrderStatus);

// Obtener todas las órdenes (opcional)
router.get('/orders', getAllOrders);

export default router;


