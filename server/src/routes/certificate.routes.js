const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const qrIdentityController = require('../controllers/qrIdentity.controller');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// ID Card Template routes
router.route('/id-cards')
    .get(certificateController.getIdCardTemplates)
    .post(requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), certificateController.createIdCardTemplate);

router.route('/id-cards/:id')
    .get(certificateController.getIdCardTemplateById)
    .put(requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), certificateController.updateIdCardTemplate)
    .delete(requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), certificateController.deleteIdCardTemplate);

// Certificate Generation routes
router.route('/transfer-certificate')
    .get(certificateController.getTransferCertificates)
    .post(certificateController.generateTransferCertificate);

// ID Card Generation routes
router.post('/generate-student-id', certificateController.generateStudentIdCard);
router.post('/generate-staff-id', certificateController.generateStaffIdCard);
router.post('/qr-identities/rotate', requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), qrIdentityController.rotateIdentity);
router.delete('/qr-identities/:id', requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), qrIdentityController.revokeIdentity);

module.exports = router;
