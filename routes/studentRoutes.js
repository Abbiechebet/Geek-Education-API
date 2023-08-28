import express from 'express';
import { createAccount, emailLogin, forgotPassword, resetPassword, } from '../controllers/studentController.js';
import { resetPasswordValidation } from '../middlewares/auth.js';

const router = express.Router();

// user registration or create account
router.post('/create-account', createAccount);
router.post('/email-login', emailLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

export { router as studentAuthRouter };
