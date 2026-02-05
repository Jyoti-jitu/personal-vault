import express from 'express';
import { addImages, getImages, deleteImage } from '../controllers/imageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', upload.array('files', 50), addImages);
router.get('/', getImages);
router.delete('/:id', deleteImage);

export default router;
