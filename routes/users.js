import express from 'express';

import UsersController from '../controller/UsersController';
import apiLimiter from '../middleware/apiLimiter';
import validate from '../middleware/validate';
import upload from '../middleware/upload';
import user from '../schemas/user';

const router = express.Router();

router.post('/upload', upload.single('avatar'), UsersController.upload);
router.post('/register', apiLimiter, validate(user.registerSchema, 'body'), UsersController.register);
router.post('/login', apiLimiter, validate(user.loginSchema, 'body'), UsersController.login);
router.post('/verify', validate(user.verifySchema, 'body'), UsersController.verify);
router.post('/forgot-pass', apiLimiter, validate(user.forgotPassSchema, 'body'), UsersController.forgot);
router.post('/resend', apiLimiter, UsersController.resendVerifyCode);
router.put('/change-pass', validate(user.changePassSchema, 'body'), UsersController.changePass);

router.put('/update', validate(user.updateSchema, 'body'), UsersController.update);
router.put('/reset-pass', validate(user.resetPassSchema, 'body'), UsersController.resetPass);

router.get('/account', UsersController.myAccount);

export default router;
