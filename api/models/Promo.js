import mongoose from 'mongoose';

const promoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    discount: { type: Number, required: true },
    validUntil: { type: Date, required: true }
});

export default mongoose.model('Promo', promoSchema);