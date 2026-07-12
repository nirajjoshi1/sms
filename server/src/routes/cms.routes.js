const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cms.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Event routes
router.route('/events')
    .get(cmsController.getEvents)
    .post(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.createEvent);

router.route('/events/:id')
    .get(cmsController.getEventById)
    .put(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.updateEvent)
    .delete(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.deleteEvent);

// Gallery routes
router.route('/gallery')
    .get(cmsController.getGalleryImages)
    .post(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.createGalleryImage);

router.route('/gallery/:id')
    .get(cmsController.getGalleryImageById)
    .put(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.updateGalleryImage)
    .delete(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.deleteGalleryImage);

// News routes
router.route('/news')
    .get(cmsController.getNews)
    .post(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.createNews);

router.route('/news/:id')
    .get(cmsController.getNewsById)
    .put(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.updateNews)
    .delete(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.deleteNews);

// Media Manager routes
router.route('/media')
    .get(cmsController.getMediaFiles)
    .post(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.uploadMediaFile);

router.route('/media/:id')
    .get(cmsController.getMediaFileById)
    .put(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.updateMediaFile)
    .delete(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.deleteMediaFile);

// Pages routes
router.route('/pages')
    .get(cmsController.getPages)
    .post(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.createPage);

router.route('/pages/:id')
    .get(cmsController.getPageById)
    .put(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.updatePage)
    .delete(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.deletePage);

// Menu routes
router.route('/menus')
    .get(cmsController.getMenus)
    .post(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.createMenu);

router.route('/menus/:id')
    .get(cmsController.getMenuById)
    .put(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.updateMenu)
    .delete(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.deleteMenu);

// Banner routes
router.route('/banners')
    .get(cmsController.getBanners)
    .post(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.createBanner);

router.route('/banners/:id')
    .get(cmsController.getBannerById)
    .put(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.updateBanner)
    .delete(requirePermission(PERMISSIONS.CMS_MANAGE), cmsController.deleteBanner);

module.exports = router;
