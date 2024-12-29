import express from 'express';
import connectDB from './services/dbService.js';
import { handleChat } from './services/chatService.js';
import Chat from './models/Chat.js';
import config from './config/config.js';

const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const { message, customerId } = req.body;
        const response = await handleChat(message, customerId);
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/chat-history/:customerId', async (req, res) => {
    try {
        const chat = await Chat.findOne({ customerId: req.params.customerId });
        res.json(chat ? chat.messages : []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

connectDB().then(() => {
    app.listen(config.port, () => {
        console.log(`Server listening on port ${config.port}`);
    });
});