import express from 'express';
import { connectDB } from './config/database.js';
import chatRoutes from './routes/chatRoutes.js';
import { config } from './config/constants.js';

const app = express();
app.use(express.json());

connectDB();

app.use('/api', chatRoutes);

const PORT = config.serverPort || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});