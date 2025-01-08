import express from 'express';
import { getSchedule, createSchedule, updateSchedule } from '../controllers/scheduleController.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/schedule', getSchedule);
router.post('/schedule', validate(schemas.schedule), createSchedule);
router.put('/schedule/:id', validate(schemas.schedule), updateSchedule);

export default router;