import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);