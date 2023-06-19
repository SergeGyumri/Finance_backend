import express from 'express';

import users from './users';
import balance from './balance';
import authorization from '../middleware/authorization';

const router = express.Router();

router.use('/users', authorization, users);
router.use('/balance', authorization, balance);

export default router;
