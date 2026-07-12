const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/income.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { validate } = require('../middleware/validate.middleware');
const financeValidation = require('../validations/finance.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Income Head routes
router.route('/heads')
    .get(incomeController.getIncomeHeads)
    .post(requirePermission(PERMISSIONS.FEES_COLLECT), validate(financeValidation.createIncomeHead), incomeController.createIncomeHead);

router.route('/heads/:id')
    .put(requirePermission(PERMISSIONS.FEES_COLLECT), validate(financeValidation.createIncomeHead), incomeController.updateIncomeHead)
    .delete(requirePermission(PERMISSIONS.FEES_CONFIGURE), incomeController.deleteIncomeHead);

// Income routes
router.route('/')
    .get(incomeController.getIncomes)
    .post(requirePermission(PERMISSIONS.FEES_COLLECT), validate(financeValidation.createIncome), incomeController.createIncome);

router.route('/:id')
    .get(incomeController.getIncomeById)
    .put(requirePermission(PERMISSIONS.FEES_COLLECT), validate(financeValidation.createIncome), incomeController.updateIncome)
    .delete(requirePermission(PERMISSIONS.FEES_CONFIGURE), incomeController.deleteIncome);

module.exports = router;
