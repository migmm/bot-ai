import express from 'express';
import { getMenu, addMenuItem } from '../controllers/menuController.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/menu', getMenu);
router.post('/menu', validate(schemas.menuItem), addMenuItem);

export default router;