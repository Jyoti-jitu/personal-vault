import express from 'express';
import { addCard, getCards, updateCard, deleteCard } from '../controllers/cardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken); // Protect all routes in this file

router.post('/', addCard);
router.get('/', getCards);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;
