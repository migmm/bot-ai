import express from 'express';
import { getMenu, addMenuItem } from '../controllers/menuController.js';

const router = express.Router();

router.get('/menu', getMenu);
router.post('/menu', addMenuItem);

export default router;