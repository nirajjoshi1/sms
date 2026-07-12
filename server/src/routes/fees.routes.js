const express = require('express');
const router = express.Router();
const feesController = require('../controllers/fees.controller');
const { requirePermission, requireSchoolContext, authorizeRoles } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { validate } = require('../middleware/validate.middleware');
const feesValidation = require('../validations/fees.validation');

// All fee routes require school context
router.use(requireSchoolContext);

// Offline bank payment routes
router.route('/offline-payments')
    .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), feesController.getOfflineBankPayments)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), validate(feesValidation.createOfflineBankPayment), feesController.createOfflineBankPayment);

router.patch('/offline-payments/:id/status', authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.updateOfflineBankPaymentStatus), feesController.updateOfflineBankPaymentStatus);

// Fee group routes
router.route('/groups')
    .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), feesController.getFeeGroups)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.createFeeGroup), feesController.createFeeGroup);

router.route('/groups/:id')
    .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.createFeeGroup), feesController.updateFeeGroup)
    .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), feesController.deleteFeeGroup);

// Fee type routes
router.route('/types')
    .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), feesController.getFeeTypes)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.createFeeType), feesController.createFeeType);

router.route('/types/:id')
    .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.createFeeType), feesController.updateFeeType)
    .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), feesController.deleteFeeType);

// Fee master routes
router.route('/masters')
    .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), feesController.getFeeMasters)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.createFeeMaster), feesController.createFeeMaster);

router.route('/masters/:id')
    .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.createFeeMaster), feesController.updateFeeMaster)
    .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), feesController.deleteFeeMaster);

// Fee discount routes
router.route('/discounts')
    .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), feesController.getFeeDiscounts)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.createFeeDiscount), feesController.createFeeDiscount);

router.route('/discounts/:id')
    .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.createFeeDiscount), feesController.updateFeeDiscount)
    .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), feesController.deleteFeeDiscount);

// Fee reminder routes
router.route('/reminders')
    .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), feesController.getFeeReminders)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.createFeeReminder), feesController.createFeeReminder);

router.route('/reminders/:id')
    .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.updateFeeReminder), feesController.updateFeeReminder)
    .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), feesController.deleteFeeReminder);

// Fee collection routes
router.post('/collect', authorizeRoles('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), validate(feesValidation.collectFee), feesController.collectFee);
router.get('/payments', authorizeRoles('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), feesController.searchFeePayments);
router.get('/due', authorizeRoles('ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'), feesController.getDueFees);
router.post('/carry-forward', authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(feesValidation.carryForwardFees), feesController.carryForwardFees);

module.exports = router;
