import { handleChat } from '../services/chatService.js';
import Chat from '../models/Chat.js';

// Function to generate customerId
const generateCustomerId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const sendMessage = async (req, res) => {
    try {
        const { message, customerId: clientCustomerId } = req.body;

        // If there is no customerId, generate a new one
        const customerId = clientCustomerId || generateCustomerId();

        // Process the message
        const { response } = await handleChat(message, customerId);

        // If it's the first message, include the customerId in the response
        let finalResponse = response;
        if (!clientCustomerId) {
            // Check if the response already includes a welcome message
            if (!response.includes("¡Bienvenido")) {
                finalResponse = `¡Bienvenido! Tu número de orden es: ${customerId}. ${response}`;
            }
        }

        // Return the response with the customerId
        res.json({ response: finalResponse, customerId });
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