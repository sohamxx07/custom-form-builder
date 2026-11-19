const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// GET /api/public/forms/:slug - Public view of a published form (no auth required)
router.get('/forms/:slug', publicController.getPublicFormBySlug);

// POST /api/public/forms/:slug/submit - Submit answers to a published form (no auth required)
router.post('/forms/:slug/submit', publicController.submitPublicForm);

module.exports = router;
