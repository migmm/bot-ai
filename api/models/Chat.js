import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    customerId: { type: String, unique: true },
    messages: [{
        timestamp: { type: Date, default: Date.now },
        message: String,
        response: String
    }],
    lastActivity: { type: Date, default: Date.now }
}, { strict: false });

export default mongoose.model('Chat', ChatSchema);