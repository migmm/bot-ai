import express from 'express';
import { getHolidays, addHoliday } from '../controllers/holidayController.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/holidays', getHolidays);
router.post('/holidays', validate(schemas.holiday), addHoliday);

export default router;