const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// =====================================
// Event Controllers
// =====================================
exports.getEvents = asyncHandler(async (req, res) => {
    const { search, isActive } = req.query;

    const events = await prisma.event.findMany({
        where: {
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { location: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(isActive !== undefined && { isActive: isActive === 'true' })
        },
        orderBy: { eventDate: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, events, "Events fetched successfully"));
});

exports.getEventById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    res.status(200).json(new ApiResponse(200, event, "Event fetched successfully"));
});

exports.createEvent = asyncHandler(async (req, res) => {
    const event = await prisma.event.create({
        data: { ...req.body }
    });
    res.status(201).json(new ApiResponse(201, event, "Event created successfully"));
});

exports.updateEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const event = await prisma.event.update({
        where: { id },
        data: { ...req.body }
    });

    res.status(200).json(new ApiResponse(200, event, "Event updated successfully"));
});

exports.deleteEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.event.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Event deleted successfully"));
});

// =====================================
// Gallery Controllers
// =====================================
exports.getGalleryImages = asyncHandler(async (req, res) => {
    const { search, category, isActive } = req.query;

    const images = await prisma.gallery.findMany({
        where: {
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(category && { category }),
            ...(isActive !== undefined && { isActive: isActive === 'true' })
        },
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, images, "Gallery images fetched successfully"));
});

exports.getGalleryImageById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const image = await prisma.gallery.findUnique({ where: { id } });

    if (!image) {
        throw new ApiError(404, "Gallery image not found");
    }

    res.status(200).json(new ApiResponse(200, image, "Gallery image fetched successfully"));
});

exports.createGalleryImage = asyncHandler(async (req, res) => {
    const image = await prisma.gallery.create({
        data: { ...req.body }
    });
    res.status(201).json(new ApiResponse(201, image, "Gallery image created successfully"));
});

exports.updateGalleryImage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const image = await prisma.gallery.update({
        where: { id },
        data: { ...req.body }
    });

    res.status(200).json(new ApiResponse(200, image, "Gallery image updated successfully"));
});

exports.deleteGalleryImage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.gallery.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Gallery image deleted successfully"));
});

// =====================================
// News Controllers
// =====================================
exports.getNews = asyncHandler(async (req, res) => {
    const { search, isActive } = req.query;

    const news = await prisma.news.findMany({
        where: {
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } },
                    { author: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(isActive !== undefined && { isActive: isActive === 'true' })
        },
        orderBy: { publishDate: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, news, "News fetched successfully"));
});

exports.getNewsById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const news = await prisma.news.findUnique({ where: { id } });

    if (!news) {
        throw new ApiError(404, "News not found");
    }

    res.status(200).json(new ApiResponse(200, news, "News fetched successfully"));
});

exports.createNews = asyncHandler(async (req, res) => {
    const news = await prisma.news.create({
        data: { ...req.body }
    });
    res.status(201).json(new ApiResponse(201, news, "News created successfully"));
});

exports.updateNews = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const news = await prisma.news.update({
        where: { id },
        data: { ...req.body }
    });

    res.status(200).json(new ApiResponse(200, news, "News updated successfully"));
});

exports.deleteNews = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.news.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "News deleted successfully"));
});

// =====================================
// Media Manager Controllers
// =====================================
exports.getMediaFiles = asyncHandler(async (req, res) => {
    const { search, fileType } = req.query;

    const files = await prisma.mediaFile.findMany({
        where: {
            ...(search && { fileName: { contains: search, mode: 'insensitive' } }),
            ...(fileType && { fileType })
        },
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, files, "Media files fetched successfully"));
});

exports.getMediaFileById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const file = await prisma.mediaFile.findUnique({ where: { id } });

    if (!file) {
        throw new ApiError(404, "Media file not found");
    }

    res.status(200).json(new ApiResponse(200, file, "Media file fetched successfully"));
});

exports.uploadMediaFile = asyncHandler(async (req, res) => {
    const { name, url, type, size } = req.body;

    if (!name || !url) {
        throw new ApiError(400, 'File name and URL are required');
    }

    const file = await prisma.mediaFile.create({
        data: {
            name,
            url,
            type: type || 'image',
            size: size ? parseInt(size) : null
        }
    });
    res.status(201).json(new ApiResponse(201, file, "Media file saved successfully"));
});

exports.updateMediaFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await prisma.mediaFile.update({
        where: { id },
        data: { ...req.body }
    });

    res.status(200).json(new ApiResponse(200, file, "Media file updated successfully"));
});

exports.deleteMediaFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.mediaFile.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Media file deleted successfully"));
});

// =====================================
// Pages Controllers
// =====================================
exports.getPages = asyncHandler(async (req, res) => {
    const { search, pageType } = req.query;

    const pages = await prisma.cmsPage.findMany({
        where: {
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(pageType && { pageType })
        },
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, pages, "Pages fetched successfully"));
});

exports.getPageById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = await prisma.cmsPage.findUnique({ where: { id } });

    if (!page) {
        throw new ApiError(404, "Page not found");
    }

    res.status(200).json(new ApiResponse(200, page, "Page fetched successfully"));
});

exports.createPage = asyncHandler(async (req, res) => {
    const page = await prisma.cmsPage.create({
        data: { ...req.body }
    });
    res.status(201).json(new ApiResponse(201, page, "Page created successfully"));
});

exports.updatePage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const page = await prisma.cmsPage.update({
        where: { id },
        data: { ...req.body }
    });

    res.status(200).json(new ApiResponse(200, page, "Page updated successfully"));
});

exports.deletePage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.cmsPage.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Page deleted successfully"));
});

// =====================================
// Menu Controllers
// =====================================
exports.getMenus = asyncHandler(async (req, res) => {
    const { parentId, isActive } = req.query;

    const menus = await prisma.menu.findMany({
        where: {
            ...(parentId !== undefined && { parentId: parentId === 'null' ? null : parentId }),
            ...(isActive !== undefined && { isActive: isActive === 'true' })
        },
        include: {
            Children: true,
            Parent: true
        },
        orderBy: { order: 'asc' }
    });

    res.status(200).json(new ApiResponse(200, menus, "Menus fetched successfully"));
});

exports.getMenuById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const menu = await prisma.menu.findUnique({
        where: { id },
        include: {
            Children: true,
            Parent: true
        }
    });

    if (!menu) {
        throw new ApiError(404, "Menu not found");
    }

    res.status(200).json(new ApiResponse(200, menu, "Menu fetched successfully"));
});

exports.createMenu = asyncHandler(async (req, res) => {
    const menu = await prisma.menu.create({
        data: { ...req.body },
        include: {
            Children: true,
            Parent: true
        }
    });
    res.status(201).json(new ApiResponse(201, menu, "Menu created successfully"));
});

exports.updateMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const menu = await prisma.menu.update({
        where: { id },
        data: { ...req.body },
        include: {
            Children: true,
            Parent: true
        }
    });

    res.status(200).json(new ApiResponse(200, menu, "Menu updated successfully"));
});

exports.deleteMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.menu.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Menu deleted successfully"));
});

// =====================================
// Banner Controllers
// =====================================
exports.getBanners = asyncHandler(async (req, res) => {
    const { isActive } = req.query;

    const banners = await prisma.bannerImage.findMany({
        where: {
            ...(isActive !== undefined && { isActive: isActive === 'true' })
        },
        orderBy: { order: 'asc' }
    });

    res.status(200).json(new ApiResponse(200, banners, "Banners fetched successfully"));
});

exports.getBannerById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const banner = await prisma.bannerImage.findUnique({ where: { id } });

    if (!banner) {
        throw new ApiError(404, "Banner not found");
    }

    res.status(200).json(new ApiResponse(200, banner, "Banner fetched successfully"));
});

exports.createBanner = asyncHandler(async (req, res) => {
    const banner = await prisma.bannerImage.create({
        data: { ...req.body }
    });
    res.status(201).json(new ApiResponse(201, banner, "Banner created successfully"));
});

exports.updateBanner = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const banner = await prisma.bannerImage.update({
        where: { id },
        data: { ...req.body }
    });

    res.status(200).json(new ApiResponse(200, banner, "Banner updated successfully"));
});

exports.deleteBanner = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.bannerImage.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Banner deleted successfully"));
});
