import mongoose from 'mongoose';
import { config } from '../config/constants.js';

const mongoDbUri = config.mongoDbUri;

export const connectDB = async () => {
    try {
        await mongoose.connect(mongoDbUri);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};