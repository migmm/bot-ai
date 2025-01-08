import { handleChat } from '../services/chatService.js';
import Chat from '../models/Chat.js';

const generateCustomerId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const sendMessage = async (req, res) => {
    try {
        const { message, customerId: clientCustomerId } = req.body;

        // Si no hay customerId, generamos uno nuevo
        const customerId = clientCustomerId || generateCustomerId();

        // Procesamos el mensaje
        const { response } = await handleChat(message, customerId);

        // Si es el primer mensaje, incluimos el customerId en la respuesta
        let finalResponse = response;
        if (!clientCustomerId) {
            // Verificamos si la respuesta ya incluye un mensaje de bienvenida
            if (!response.includes("¡Bienvenido")) {
                finalResponse = `¡Bienvenido! Tu número de pedido es: ${customerId}. ${response}`;
            }
        }

        // Devolvemos la respuesta con el customerId
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