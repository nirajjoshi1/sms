const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { validate } = require('../middleware/validate.middleware');
const financeValidation = require('../validations/finance.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Expense Head routes
router.route('/heads')
    .get(expenseController.getExpenseHeads)
    .post(requirePermission(PERMISSIONS.FEES_COLLECT), validate(financeValidation.createExpenseHead), expenseController.createExpenseHead);

router.route('/heads/:id')
    .put(requirePermission(PERMISSIONS.FEES_COLLECT), validate(financeValidation.createExpenseHead), expenseController.updateExpenseHead)
    .delete(requirePermission(PERMISSIONS.FEES_CONFIGURE), expenseController.deleteExpenseHead);

// Expense routes
router.route('/')
    .get(expenseController.getExpenses)
    .post(requirePermission(PERMISSIONS.FEES_COLLECT), validate(financeValidation.createExpense), expenseController.createExpense);

router.route('/:id')
    .get(expenseController.getExpenseById)
    .put(requirePermission(PERMISSIONS.FEES_COLLECT), validate(financeValidation.createExpense), expenseController.updateExpense)
    .delete(requirePermission(PERMISSIONS.FEES_CONFIGURE), expenseController.deleteExpense);

module.exports = router;
