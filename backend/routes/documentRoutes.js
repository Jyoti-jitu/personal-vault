import express from 'express';
import {
    addDocuments,
    getDocuments,
    batchDeleteDocuments,
    downloadDocument,
    updateDocument,
    deleteDocument
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', upload.array('files', 50), addDocuments); // Also handles single file update if passed differently, but controller expects 'files' array for POST. 
// Wait, my controller logic for updateDocument uses req.file (single), but POST uses req.files (array).
// The routes need to match.
router.get('/', getDocuments);
router.post('/delete-batch', batchDeleteDocuments);
router.get('/:id/download', downloadDocument);
router.put('/:id', upload.single('file'), updateDocument);
router.delete('/:id', deleteDocument);

export default router;
