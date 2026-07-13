const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const upload = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validate.middleware');
const studentValidation = require('../validations/student.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Get all students
router.get('/', requirePermission(PERMISSIONS.STUDENTS_READ), studentController.getStudents);


// Get disabled students
router.get('/disabled', requirePermission(PERMISSIONS.STUDENTS_READ), studentController.getDisabledStudents);

// Admit new student (with photo and birth certificate upload)
router.post(
    '/admit',
    requirePermission(PERMISSIONS.STUDENTS_READ),
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'birthCertificate', maxCount: 1 }
    ]),
    validate(studentValidation.admitStudent),
    studentController.admitStudent
);

// Bulk admit students
router.post('/bulk-admit',
    requirePermission(PERMISSIONS.STUDENT_CREATE),
    validate(studentValidation.bulkAdmitStudents),
    studentController.bulkAdmitStudents
);

// Bulk delete students
router.post(
    '/bulk-delete',
    requirePermission(PERMISSIONS.SETTINGS_MANAGE),
    validate(studentValidation.bulkDeleteStudents),
    studentController.bulkDeleteStudents
);

// Get student details by ID
router.get('/:id', requirePermission(PERMISSIONS.STUDENTS_READ), studentController.getStudentDetails);

// Update student (with photo and birth certificate upload)
router.put(
    '/:id',
    requirePermission(PERMISSIONS.STUDENTS_READ),
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'birthCertificate', maxCount: 1 }
    ]),
    validate(studentValidation.updateStudent),
    studentController.updateStudent
);

// Delete student (soft delete)
router.delete(
    '/:id',
    requirePermission(PERMISSIONS.SETTINGS_MANAGE),
    studentController.deleteStudent
);

// Toggle student status (disable/enable)
router.patch(
    '/:id/status',
    requirePermission(PERMISSIONS.SETTINGS_MANAGE),
    studentController.toggleStudentStatus
);

// Moved to top

module.exports = router;
