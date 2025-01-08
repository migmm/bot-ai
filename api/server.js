import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import chatRoutes from './routes/chatRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import businessInfoRoutes from './routes/businessInfoRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { config } from './config/constants.js';

const app = express();
app.use(express.json());

app.use(cors({
    origin: '*',
}));

app.use(express.static('public', { extensions: ['html', 'htm'] }));


connectDB();

app.use('/api', chatRoutes);
app.use('/api', menuRoutes);
app.use('/api', promoRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', holidayRoutes);
app.use('/api', businessInfoRoutes);
app.use('/api', orderRoutes);

const PORT = config.serverPort || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});