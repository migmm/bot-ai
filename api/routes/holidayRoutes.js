import express from 'express';
import { getHolidays, addHoliday } from '../controllers/holidayController.js';

const router = express.Router();

router.get('/holidays', getHolidays);
router.post('/holidays', addHoliday);

export default router;