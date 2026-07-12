const express = require('express');
const router = express.Router();
const academicsController = require('../controllers/academics.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { validate } = require('../middleware/validate.middleware');
const academicsValidation = require('../validations/academics.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Class routes
router.route('/classes')
    .get(academicsController.getClasses)
    .post(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createClass), academicsController.createClass);

router.route('/classes/:id')
    .put(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createClass), academicsController.updateClass)
    .delete(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), academicsController.deleteClass);

// Section routes
router.route('/sections')
    .get(academicsController.getSections)
    .post(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createSection), academicsController.createSection);

router.route('/sections/:id')
    .put(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createSection), academicsController.updateSection)
    .delete(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), academicsController.deleteSection);

// Subject routes
router.route('/subjects')
    .get(academicsController.getSubjects)
    .post(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createSubject), academicsController.createSubject);

router.route('/subjects/:id')
    .put(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createSubject), academicsController.updateSubject)
    .delete(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), academicsController.deleteSubject);

// Subject Group routes
router.route('/subject-groups')
    .get(academicsController.getSubjectGroups)
    .post(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createSubjectGroup), academicsController.createSubjectGroup);

router.route('/subject-groups/:id')
    .put(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createSubjectGroup), academicsController.updateSubjectGroup)
    .delete(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), academicsController.deleteSubjectGroup);

// Class Teacher routes
router.route('/class-teachers')
    .get(academicsController.getClassTeachers)
    .post(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.assignClassTeacher), academicsController.assignClassTeacher);

router.route('/class-teachers/:id')
    .delete(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), academicsController.removeClassTeacher);

// Timetable routes
router.route('/timetable')
    .get(academicsController.getTimetables)
    .post(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createTimetable), academicsController.createTimetable);

router.route('/timetable/:id')
    .put(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), validate(academicsValidation.createTimetable), academicsController.updateTimetable)
    .delete(requirePermission(PERMISSIONS.ACADEMICS_MANAGE), academicsController.deleteTimetable);

// Student Promotion
router.post('/promote-students',
    requirePermission(PERMISSIONS.STUDENTS_PROMOTE),
    validate(academicsValidation.promoteStudents),
    academicsController.promoteStudents);

// Admin marks overview
router.get('/marks', requirePermission(PERMISSIONS.ACADEMICS_READ), academicsController.getAllMarks);

module.exports = router;
