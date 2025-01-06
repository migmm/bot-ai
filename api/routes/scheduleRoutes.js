import express from 'express';
import { getSchedule, updateSchedule } from '../controllers/scheduleController.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/schedule', getSchedule);
router.put('/schedule/:id',  validate(schemas.schedule), updateSchedule);

export default router;