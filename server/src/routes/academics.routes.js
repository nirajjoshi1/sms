const express = require('express');
const router = express.Router();
const academicsController = require('../controllers/academics.controller');
const { verifyJWT, authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const academicsValidation = require('../validations/academics.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Class routes
router.route('/classes')
    .get(academicsController.getClasses)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.createClass), academicsController.createClass);

router.route('/classes/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.createClass), academicsController.updateClass)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteClass);

// Section routes
router.route('/sections')
    .get(academicsController.getSections)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.createSection), academicsController.createSection);

router.route('/sections/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.createSection), academicsController.updateSection)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteSection);

// Subject routes
router.route('/subjects')
    .get(academicsController.getSubjects)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), validate(academicsValidation.createSubject), academicsController.createSubject);

router.route('/subjects/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.createSubject), academicsController.updateSubject)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteSubject);

// Subject Group routes
router.route('/subject-groups')
    .get(academicsController.getSubjectGroups)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.createSubjectGroup), academicsController.createSubjectGroup);

router.route('/subject-groups/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.createSubjectGroup), academicsController.updateSubjectGroup)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteSubjectGroup);

// Class Teacher routes
router.route('/class-teachers')
    .get(academicsController.getClassTeachers)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.assignClassTeacher), academicsController.assignClassTeacher);

router.route('/class-teachers/:id')
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.removeClassTeacher);

// Timetable routes
router.route('/timetable')
    .get(academicsController.getTimetables)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.createTimetable), academicsController.createTimetable);

router.route('/timetable/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(academicsValidation.createTimetable), academicsController.updateTimetable)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteTimetable);

// Student Promotion
router.post('/promote-students',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    validate(academicsValidation.promoteStudents),
    academicsController.promoteStudents);

// Admin marks overview
router.get('/marks', authorizeRoles('ADMIN'), academicsController.getAllMarks);

module.exports = router;
