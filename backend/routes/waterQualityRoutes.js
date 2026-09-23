import express from 'express';
import { 
    addTestResult,
    getAllTests,
    getTestById,
    getWellHistory, 
    updateTestResult, 
    deleteTestResult 
} from '../controllers/waterQualityController.js';


//import { protect } from '../middleware/authMiddleware.js'; 
//project's middleware exports protect
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();


// Defined routes for Water Quality Monitoring
router.get('/', protect, getAllTests);
//router.get('/', getAllTests); 

router.get('/well/:wellId', protect, getWellHistory);
router.get('/:id', protect, getTestById);

//router.post('/', protect, addTestResult);
router.post(
    '/',
    protect,
    authorizeRoles('lab_tester', 'admin'),
    addTestResult
    
);



//router.put('/:id', protect, updateTestResult);
router.put(
    '/:id',
    protect,
    authorizeRoles('lab_tester', 'admin'),
    updateTestResult
);


//router.delete('/:id', protect, deleteTestResult);
router.delete(
    '/:id',
    protect,
    authorizeRoles('lab_tester', 'admin'),
    deleteTestResult
);


export default router;
