const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/income.controller');
const { verifyJWT, authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const financeValidation = require('../validations/finance.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Income Head routes
router.route('/heads')
    .get(incomeController.getIncomeHeads)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), validate(financeValidation.createIncomeHead), incomeController.createIncomeHead);

router.route('/heads/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), validate(financeValidation.createIncomeHead), incomeController.updateIncomeHead)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), incomeController.deleteIncomeHead);

// Income routes
router.route('/')
    .get(incomeController.getIncomes)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), validate(financeValidation.createIncome), incomeController.createIncome);

router.route('/:id')
    .get(incomeController.getIncomeById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), validate(financeValidation.createIncome), incomeController.updateIncome)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), incomeController.deleteIncome);

module.exports = router;
