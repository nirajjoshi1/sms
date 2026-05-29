const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');

router.route('/income-heads')
    .get(financeController.getIncomeHeads)
    .post(financeController.createIncomeHead);

router.route('/income')
    .get(financeController.getIncomes)
    .post(financeController.createIncome);

router.route('/expense-heads')
    .get(financeController.getExpenseHeads)
    .post(financeController.createExpenseHead);

router.route('/expense')
    .get(financeController.getExpenses)
    .post(financeController.createExpense);

module.exports = router;
