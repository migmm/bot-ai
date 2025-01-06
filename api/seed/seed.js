import mongoose from 'mongoose';
import businessInfo from '../data/businessInfo.js';
import holidays from '../data/holidays.js';
import menu from '../data/menu.js';
import promos from '../data/promos.js';
import schedule from '../data/schedule.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Holiday from '../models/Holiday.js';
import Menu from '../models/Menu.js';
import Promo from '../models/Promo.js';
import Schedule from '../models/Schedule.js';
import { config } from '../config/constants.js';


export const seedDatabase = async () => {
    try {
        const businessInfoCount = await BusinessInfo.countDocuments();
        const holidayCount = await Holiday.countDocuments();
        const menuCount = await Menu.countDocuments();
        const promoCount = await Promo.countDocuments();
        const scheduleCount = await Schedule.countDocuments();

        if (businessInfoCount === 0) {
            await BusinessInfo.insertMany([businessInfo]);
            console.log('Datos de BusinessInfo cargados.');
        }
        if (holidayCount === 0) {
            await Holiday.insertMany(holidays);
            console.log('Datos de Holidays cargados.');
        }
        if (menuCount === 0) {
            await Menu.insertMany(menu);
            console.log('Datos de Menu cargados.');
        }
        if (promoCount === 0) {
            await Promo.insertMany(promos);
            console.log('Datos de Promos cargados.');
        }
        if (scheduleCount === 0) {
            await Schedule.insertMany(schedule);
            console.log('Datos de Schedule cargados.');
        }

        console.log('Seeder ejecutado exitosamente.');
    } catch (error) {
        console.error('Error al ejecutar el seeder:', error);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    mongoose.connect(config.mongoDbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Conectado a MongoDB para ejecutar el seeder.');
        seedDatabase().finally(() => mongoose.connection.close());
    })
    .catch((error) => {
        console.error('Error al conectar a MongoDB:', error);
    });
}