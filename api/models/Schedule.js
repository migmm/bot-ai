import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    day: { type: String, required: true },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    isDeliveryAvailable: { type: Boolean, required: true }
});

export default mongoose.model('Schedule', scheduleSchema);