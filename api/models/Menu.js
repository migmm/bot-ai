import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    pieces: { type: Number },
    size: { type: String },
    volume: { type: String },
    servings: { type: Number }
});

export default mongoose.model('Menu', menuItemSchema);