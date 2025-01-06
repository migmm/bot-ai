import express from 'express';
import { getPromos, addPromo } from '../controllers/promoController.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/promos', getPromos);
router.post('/promos',  validate(schemas.promo), addPromo);

export default router;