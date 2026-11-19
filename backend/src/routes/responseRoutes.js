const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all creator response routes
router.use(authMiddleware);

// GET /api/forms/:formId/responses - Get all responses for a form
router.get('/:formId/responses', responseController.getFormResponses);

// GET /api/forms/:formId/responses/:responseId - Get a single response
router.get('/:formId/responses/:responseId', responseController.getSingleResponse);

module.exports = router;
