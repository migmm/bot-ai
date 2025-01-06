import express from 'express';
import { getBusinessInfo, updateBusinessInfo } from '../controllers/businessInfoController.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/business-info', getBusinessInfo);
router.put('/business-info/:id', validate(schemas.businessInfo), updateBusinessInfo);

export default router;