import express from 'express';
import { getStudentStatistics, updateStudentStatistics } from '../controllers/studentStatisticsController.js';

const router = express.Router();

// Routes for student statistics
router.get('/', getStudentStatistics);
router.put('/', updateStudentStatistics);

export { router as studentStatisticsRouter };
