import express from 'express';
import { 
    addTestResult,
    getAllTests,
    getTestById,
    getWellHistory, 
    updateTestResult, 
    deleteTestResult 
} from '../controllers/waterQualityController.js';

const router = express.Router();

// Defined routes for Water Quality Monitoring
router.get('/', getAllTests);
router.get('/well/:wellId', getWellHistory);
router.get('/:id', getTestById);
router.post('/', addTestResult);
router.put('/:id', updateTestResult);
router.delete('/:id', deleteTestResult);

export default router;
