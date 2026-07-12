const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Certificate Template routes
router.route('/templates')
    .get(certificateController.getCertificateTemplates)
    .post(requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), certificateController.createCertificateTemplate);

router.route('/templates/:id')
    .get(certificateController.getCertificateTemplateById)
    .put(requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), certificateController.updateCertificateTemplate)
    .delete(requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), certificateController.deleteCertificateTemplate);

// ID Card Template routes
router.route('/id-cards')
    .get(certificateController.getIdCardTemplates)
    .post(requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), certificateController.createIdCardTemplate);

router.route('/id-cards/:id')
    .get(certificateController.getIdCardTemplateById)
    .put(requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), certificateController.updateIdCardTemplate)
    .delete(requirePermission(PERMISSIONS.CERTIFICATES_GENERATE), certificateController.deleteIdCardTemplate);

// Certificate Generation routes
router.post('/generate', certificateController.generateCertificate);
router.post('/generate-bulk', certificateController.generateBulkCertificates);
router.post('/transfer-certificate', certificateController.generateTransferCertificate);

// ID Card Generation routes
router.post('/generate-student-id', certificateController.generateStudentIdCard);
router.post('/generate-staff-id', certificateController.generateStaffIdCard);

module.exports = router;
