const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { verifyJWT, requireSchoolContext } = require('../middleware/auth.middleware');

router.use(verifyJWT);
router.use(requireSchoolContext);
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Upload single image
// @route   POST /api/v1/upload/image
// @access  Private
router.post('/image', verifyJWT, upload.single('image'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(new ApiResponse(400, null, "No file uploaded"));
    }

    return res.status(200).json(
        new ApiResponse(200, {
            url: req.file.path,
            public_id: req.file.filename
        }, "Image uploaded successfully")
    );
}));

// @desc    Upload multiple images
// @route   POST /api/v1/upload/images
// @access  Private
router.post('/images', verifyJWT, upload.array('images', 10), asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json(new ApiResponse(400, null, "No files uploaded"));
    }

    const uploadedFiles = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
    }));

    return res.status(200).json(
        new ApiResponse(200, uploadedFiles, `${uploadedFiles.length} image(s) uploaded successfully`)
    );
}));

module.exports = router;
