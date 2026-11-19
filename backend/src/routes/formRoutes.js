const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all form management routes
router.use(authMiddleware);

// CRUD endpoints
router.post('/', formController.createForm);
router.get('/', formController.getAllForms);
router.get('/:id', formController.getFormById);
router.put('/:id', formController.updateForm);
router.delete('/:id', formController.deleteForm);

// Test submission endpoint
router.post('/:id/test-submit', formController.testSubmit);

// Publish form endpoint
router.post('/:id/publish', formController.publishForm);

module.exports = router;
