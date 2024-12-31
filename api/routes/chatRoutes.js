import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/chat', sendMessage);
router.get('/chat-history/:customerId', getChatHistory);

export default router;