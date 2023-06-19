import express from 'express';

import BalanceController from '../controller/BalanceController';
import balanceSchema from '../schemas/balance';
import validate from '../middleware/validate';

const router = express.Router();

router.get('/deleted-repeat-history', validate(balanceSchema.getRepeatHistory, 'body'), BalanceController.getDeletedRepeatList);
router.get('/repeat-history', validate(balanceSchema.getRepeatHistory, 'body'), BalanceController.getRepeatList);
router.get('/deleted-history', validate(balanceSchema.getHistory, 'query'), BalanceController.getDeletedHistory);
router.get('/balance', BalanceController.getBalance);
router.get('/history', validate(balanceSchema.getHistory, 'query'), BalanceController.getHistory);
router.get('/notifications', BalanceController.getNotifications);
router.get('/download', validate(balanceSchema.downloadXlsx, 'query'), BalanceController.downloadXlsx);

router.post('/income', validate(balanceSchema.newIncome, 'body'), BalanceController.newIncome);

router.put('/repeat-income', validate(balanceSchema.updateRepeatedIncome, 'body'), BalanceController.updateRepeatedIncome);
router.put('/income', validate(balanceSchema.updateIncome, 'body'), BalanceController.updateIncome);
router.put('/seen', BalanceController.seen);
router.put('/accept/:incomeId', validate(balanceSchema.incomeId, 'params'), BalanceController.acceptIncome);
router.put('/reject/:incomeId', validate(balanceSchema.incomeId, 'params'), BalanceController.rejectIncome);
router.put('/resume/:incomeId', validate(balanceSchema.incomeId, 'params'), BalanceController.resumeIncome);

router.delete('/repeat-income/:incomeId', validate(balanceSchema.deleteRepeatedIncome, 'params'), BalanceController.deleteRepeatedIncome);
router.delete('/income/:incomeId', validate(balanceSchema.deleteIncome, 'params'), BalanceController.deleteIncome);

export default router;
