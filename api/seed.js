import { seedDatabase } from './seed/seed.js';
import { connectDB } from './config/database.js';
import mongoose from 'mongoose';

const main = async () => {
    try {
        await connectDB();
        await seedDatabase();
        console.log('Seed completado con éxito');
    } catch (error) {
        console.error('Error durante el seed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Conexión a la base de datos cerrada');
    }
};

main();