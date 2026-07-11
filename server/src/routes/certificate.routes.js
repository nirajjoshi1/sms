const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const { verifyJWT, authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Certificate Template routes
router.route('/templates')
    .get(certificateController.getCertificateTemplates)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), certificateController.createCertificateTemplate);

router.route('/templates/:id')
    .get(certificateController.getCertificateTemplateById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), certificateController.updateCertificateTemplate)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), certificateController.deleteCertificateTemplate);

// ID Card Template routes
router.route('/id-cards')
    .get(certificateController.getIdCardTemplates)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), certificateController.createIdCardTemplate);

router.route('/id-cards/:id')
    .get(certificateController.getIdCardTemplateById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), certificateController.updateIdCardTemplate)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), certificateController.deleteIdCardTemplate);

// Certificate Generation routes
router.post('/generate', certificateController.generateCertificate);
router.post('/generate-bulk', certificateController.generateBulkCertificates);
router.post('/transfer-certificate', certificateController.generateTransferCertificate);

// ID Card Generation routes
router.post('/generate-student-id', certificateController.generateStudentIdCard);
router.post('/generate-staff-id', certificateController.generateStaffIdCard);

module.exports = router;
