import express from 'express';
import {
    getPersonalInfo,
    addPersonalInfo,
    updatePersonalInfo,
    deletePersonalInfo,
    downloadPersonalInfo
} from '../controllers/personalInfoController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getPersonalInfo);
router.post('/', upload.single('file'), addPersonalInfo);
router.put('/:id', upload.single('file'), updatePersonalInfo);
router.delete('/:id', deletePersonalInfo);
router.get('/:id/download', downloadPersonalInfo);

export default router;
