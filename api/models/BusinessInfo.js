import mongoose from 'mongoose';

const businessInfoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
});

export default mongoose.model('BusinessInfo', businessInfoSchema);