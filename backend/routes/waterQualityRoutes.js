import express from 'express';
import {
    addTestResult,
    getAllTests,
    getTestById,
    getWellHistory,
    updateTestResult,
    deleteTestResult
} from '../controllers/waterQualityController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Previously EVERY route below was public: an unauthenticated attacker could
// read, forge or delete laboratory water-quality results (OWASP A01 Broken
// Access Control). All routes now require a valid JWT, and write operations
// are restricted to the roles that are actually responsible for lab data.
router.use(protect);

const READ_ROLES = ["admin", "field_officer", "lab_tester", "customer", "communityUser"];
const WRITE_ROLES = ["admin", "lab_tester"];

// Defined routes for Water Quality Monitoring
router.get('/', authorizeRoles(...READ_ROLES), getAllTests);
router.get('/well/:wellId', authorizeRoles(...READ_ROLES), getWellHistory);
router.get('/:id', authorizeRoles(...READ_ROLES), getTestById);
router.post('/', authorizeRoles(...WRITE_ROLES), addTestResult);
router.put('/:id', authorizeRoles(...WRITE_ROLES), updateTestResult);
router.delete('/:id', authorizeRoles("admin"), deleteTestResult);

export default router;
