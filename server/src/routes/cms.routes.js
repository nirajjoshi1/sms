const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cms.controller');
const { verifyJWT, authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Event routes
router.route('/events')
    .get(cmsController.getEvents)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.createEvent);

router.route('/events/:id')
    .get(cmsController.getEventById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.updateEvent)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.deleteEvent);

// Gallery routes
router.route('/gallery')
    .get(cmsController.getGalleryImages)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.createGalleryImage);

router.route('/gallery/:id')
    .get(cmsController.getGalleryImageById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.updateGalleryImage)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.deleteGalleryImage);

// News routes
router.route('/news')
    .get(cmsController.getNews)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.createNews);

router.route('/news/:id')
    .get(cmsController.getNewsById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.updateNews)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.deleteNews);

// Media Manager routes
router.route('/media')
    .get(cmsController.getMediaFiles)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.uploadMediaFile);

router.route('/media/:id')
    .get(cmsController.getMediaFileById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.updateMediaFile)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.deleteMediaFile);

// Pages routes
router.route('/pages')
    .get(cmsController.getPages)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.createPage);

router.route('/pages/:id')
    .get(cmsController.getPageById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.updatePage)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.deletePage);

// Menu routes
router.route('/menus')
    .get(cmsController.getMenus)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.createMenu);

router.route('/menus/:id')
    .get(cmsController.getMenuById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.updateMenu)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.deleteMenu);

// Banner routes
router.route('/banners')
    .get(cmsController.getBanners)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.createBanner);

router.route('/banners/:id')
    .get(cmsController.getBannerById)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.updateBanner)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), cmsController.deleteBanner);

module.exports = router;
