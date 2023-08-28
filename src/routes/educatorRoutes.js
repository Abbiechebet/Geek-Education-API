import express from 'express';
import { createAccount, emailLogin, forgotPassword, resetPassword, } from '../controllers/educatorController.js';
import { educatorResetPasswordValidation } from '../middlewares/auth.js';

const router = express.Router();

// user registration or create account
router.post('/create-account', createAccount);
router.post('/email-login', emailLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', educatorResetPasswordValidation, resetPassword);

export { router as educatorAuthRouter };
