const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');
const formFieldController = require('../controllers/formFieldController');
const authMiddleware = require('../middleware/authMiddleware');

// Multer temporary storage configuration for testing uploads
const upload = multer({
  dest: path.join(os.tmpdir(), 'custom_form_builder_test_uploads'),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max limit
});

// Protect all form field routes
router.use(authMiddleware);

// Form field endpoints
router.post('/:formId/fields', formFieldController.createField);
router.get('/:formId/fields', formFieldController.getFields);
router.put('/:formId/fields/:fieldId', formFieldController.updateField);
router.delete('/:formId/fields/:fieldId', formFieldController.deleteField);

// Test upload endpoint with server-side validation and immediate cleanup
router.post(
  '/:formId/fields/:fieldId/test-upload',
  upload.single('file'),
  formFieldController.testUploadField
);

module.exports = router;
