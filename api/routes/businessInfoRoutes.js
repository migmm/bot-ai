import express from 'express';
import { getBusinessInfo, updateBusinessInfo } from '../controllers/businessInfoController.js';

const router = express.Router();

router.get('/business-info', getBusinessInfo);
router.put('/business-info/:id', updateBusinessInfo);

export default router;