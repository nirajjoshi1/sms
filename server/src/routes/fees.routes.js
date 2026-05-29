const express = require('express');
const router = express.Router();
const feesController = require('../controllers/fees.controller');

// Offline bank payment routes
router.route('/offline-payments')
    .get(feesController.getOfflineBankPayments)
    .post(feesController.createOfflineBankPayment);

router.patch('/offline-payments/:id/status', feesController.updateOfflineBankPaymentStatus);

// Fee group routes
router.route('/groups')
    .get(feesController.getFeeGroups)
    .post(feesController.createFeeGroup);

router.route('/groups/:id')
    .put(feesController.updateFeeGroup)
    .delete(feesController.deleteFeeGroup);

// Fee type routes
router.route('/types')
    .get(feesController.getFeeTypes)
    .post(feesController.createFeeType);

router.route('/types/:id')
    .put(feesController.updateFeeType)
    .delete(feesController.deleteFeeType);

// Fee master routes
router.route('/masters')
    .get(feesController.getFeeMasters)
    .post(feesController.createFeeMaster);

router.route('/masters/:id')
    .put(feesController.updateFeeMaster)
    .delete(feesController.deleteFeeMaster);

// Fee discount routes
router.route('/discounts')
    .get(feesController.getFeeDiscounts)
    .post(feesController.createFeeDiscount);

router.route('/discounts/:id')
    .put(feesController.updateFeeDiscount)
    .delete(feesController.deleteFeeDiscount);

// Fee reminder routes
router.route('/reminders')
    .get(feesController.getFeeReminders)
    .post(feesController.createFeeReminder);

router.route('/reminders/:id')
    .put(feesController.updateFeeReminder)
    .delete(feesController.deleteFeeReminder);

// Fee collection routes
router.post('/collect', feesController.collectFee);
router.get('/payments', feesController.searchFeePayments);
router.get('/due', feesController.getDueFees);
router.post('/carry-forward', feesController.carryForwardFees);

module.exports = router;
