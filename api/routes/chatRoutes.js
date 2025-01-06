import express from 'express';
import { sendMessage,} from '../controllers/chatController.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.post('/chat', validate(schemas.chat), sendMessage);


export default router;