const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyJWT, authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Get all students
router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'), studentController.getStudents);

// Get disabled students
router.get('/disabled', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'), studentController.getDisabledStudents);

// Admit new student (with photo and birth certificate upload)
router.post(
    '/admit',
    authorizeRoles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'),
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'birthCertificate', maxCount: 1 }
    ]),
    studentController.admitStudent
);

// Get student details by ID
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'), studentController.getStudentDetails);

// Update student (with photo and birth certificate upload)
router.put(
    '/:id',
    authorizeRoles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'),
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'birthCertificate', maxCount: 1 }
    ]),
    studentController.updateStudent
);

// Delete student (soft delete)
router.delete(
    '/:id',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    studentController.deleteStudent
);

// Toggle student status (disable/enable)
router.patch(
    '/:id/status',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    studentController.toggleStudentStatus
);

// Bulk delete students
router.post(
    '/bulk-delete',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    studentController.bulkDeleteStudents
);

module.exports = router;
