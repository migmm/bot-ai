import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    name: { type: String, required: true },
    reopenDate: { type: Date, required: true }
});

export default mongoose.model('Holiday', holidaySchema);