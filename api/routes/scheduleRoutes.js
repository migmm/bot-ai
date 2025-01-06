import express from 'express';
import { getSchedule, updateSchedule } from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/schedule', getSchedule);
router.put('/schedule/:id', updateSchedule);

export default router;