import express from 'express';
import { getPromos, addPromo } from '../controllers/promoController.js';

const router = express.Router();

router.get('/promos', getPromos);
router.post('/promos', addPromo);

export default router;