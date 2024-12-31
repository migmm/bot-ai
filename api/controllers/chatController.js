import { handleChat } from '../services/chatService.js';
import Chat from '../models/Chat.js';

export const sendMessage = async (req, res) => {
    try {
        const { message, customerId } = req.body;
        const response = await handleChat(message, customerId);
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ customerId: req.params.customerId });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        res.json(chat.messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};