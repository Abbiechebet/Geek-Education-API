import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { createAccount, emailLogin, forgotPassword, resetPassword, resendOTP, verifyOTP} from '../controllers/studentController.js';
import { resetPasswordValidation } from '../middlewares/auth.js';

const router = express.Router();

// user registration or create account
router.post('/create-account', createAccount);
router.post('/email-login', emailLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/resend-otp', authenticateToken, resendOTP);
router.post('/verify-otp', authenticateToken, verifyOTP);

export { router as studentAuthRouter };
