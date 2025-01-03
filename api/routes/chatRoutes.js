import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/chat', sendMessage);
router.get('/order/:customerId', getChatHistory);

export default router;