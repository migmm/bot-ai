import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    messages: [
        {
            role: { type: String, required: true, default: 'user' },
            content: { type: String, required: true, default: '' },
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

export default mongoose.model('Chat', chatSchema);