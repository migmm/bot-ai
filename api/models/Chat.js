import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    customerId: String,
    timestamp: { type: Date, default: Date.now },
    message: String,
    response: String,
    consultationNumber: String
}, { strict: false });

export default mongoose.model('Chat', ChatSchema);