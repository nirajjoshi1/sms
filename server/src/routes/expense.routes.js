const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { verifyJWT, authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const financeValidation = require('../validations/finance.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Expense Head routes
router.route('/heads')
    .get(expenseController.getExpenseHeads)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), validate(financeValidation.createExpenseHead), expenseController.createExpenseHead);

router.route('/heads/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), validate(financeValidation.createExpenseHead), expenseController.updateExpenseHead)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), expenseController.deleteExpenseHead);

// Expense routes
router.route('/')
    .get(expenseController.getExpenses)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), validate(financeValidation.createExpense), expenseController.createExpense);

router.route('/:id')
    .get(expenseController.getExpenseById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), validate(financeValidation.createExpense), expenseController.updateExpense)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), expenseController.deleteExpense);

module.exports = router;
