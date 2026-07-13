const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { requireSchoolContext, requirePermission, authorizeRoles } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.use(requireSchoolContext);

// Income Head routes
router.route('/income-heads')
    .get(financeController.getIncomeHeads)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.createIncomeHead);

router.route('/income-heads/:id')
    .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.updateIncomeHead)
    .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.deleteIncomeHead);

// Income routes
router.route('/income')
    .get(financeController.getIncomes)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.createIncome);

router.route('/income/:id')
    .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.updateIncome)
    .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.deleteIncome);

// Expense Head routes
router.route('/expense-heads')
    .get(financeController.getExpenseHeads)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.createExpenseHead);

router.route('/expense-heads/:id')
    .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.updateExpenseHead)
    .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.deleteExpenseHead);

// Expense routes
router.route('/expense')
    .get(financeController.getExpenses)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.createExpense);

router.route('/expense/:id')
    .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.updateExpense)
    .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), financeController.deleteExpense);

module.exports = router;
