const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { upload } = require('../middleware/uploadMiddleware');

// GET /api/public/forms/:slug - Public view of a published form (no auth required)
router.get('/forms/:slug', publicController.getPublicFormBySlug);

// POST /api/public/forms/:slug/upload - Upload an actual image or file for a question (no auth required)
router.post(
  '/forms/:slug/upload',
  upload.single('file'),
  publicController.uploadPublicFile
);

// POST /api/public/forms/:slug/submit - Submit answers to a published form (supports JSON & multipart)
router.post(
  '/forms/:slug/submit',
  upload.any(),
  publicController.submitPublicForm
);

module.exports = router;
