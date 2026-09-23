import express from 'express';
import { 
    addTestResult,
    getAllTests,
    getTestById,
    getWellHistory, 
    updateTestResult, 
    deleteTestResult 
} from '../controllers/waterQualityController.js';

import { protect } from '../middleware/authMiddleware.js'; 
//project's middleware exports protect

const router = express.Router();



// Defined routes for Water Quality Monitoring
router.get('/', protect, getAllTests);
//router.get('/', getAllTests); 

router.get('/well/:wellId', protect, getWellHistory);
router.get('/:id', protect, getTestById);
router.post('/', protect, addTestResult);
router.put('/:id', protect, updateTestResult);
router.delete('/:id', protect, deleteTestResult);

export default router;
