import express from 'express';
import { getAlbums, createAlbum, deleteAlbum } from '../controllers/albumController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAlbums);
router.post('/', createAlbum);
router.delete('/:id', deleteAlbum);

export default router;
