import express from 'express';
import { getFolders, createFolder, deleteFolder } from '../controllers/folderController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getFolders);
router.post('/', createFolder);
router.delete('/:id', deleteFolder);

export default router;
