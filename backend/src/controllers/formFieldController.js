const fs = require('fs');
const { Form, FormField } = require('../models');

// Whitelist of supported extensions mapped to standard MIME types
const ALLOWED_EXTENSION_MIME_MAP = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xls: ['application/vnd.ms-excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

// Validates and prepares file upload configuration
const validateFileOptions = (options) => {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return { error: 'File upload configuration is required' };
  }

  const { allowedExtensions, maxFileSizeMB } = options;

  if (!Array.isArray(allowedExtensions) || allowedExtensions.length === 0) {
    return { error: 'At least one allowed file extension must be selected' };
  }

  const sanitizedExtensions = [];
  const validExtensionKeys = Object.keys(ALLOWED_EXTENSION_MIME_MAP);

  for (const ext of allowedExtensions) {
    const cleanExt = String(ext).trim().toLowerCase().replace(/^\./, '');
    if (!validExtensionKeys.includes(cleanExt)) {
      return {
        error: `Invalid file extension: .${cleanExt}. Allowed: ${validExtensionKeys.join(', ').toUpperCase()}`,
      };
    }
    if (!sanitizedExtensions.includes(cleanExt)) {
      sanitizedExtensions.push(cleanExt);
    }
  }

  const size = Number(maxFileSizeMB);
  if (isNaN(size) || size <= 0) {
    return { error: 'Maximum file size must be a positive number in MB' };
  }
  if (size > 100) {
    return { error: 'Maximum file size cannot exceed 100 MB' };
  }

  // Pre-compile allowed MIME types from verified extensions for future upload verification
  const allowedMimeTypes = Array.from(
    new Set(sanitizedExtensions.flatMap((ext) => ALLOWED_EXTENSION_MIME_MAP[ext] || []))
  );

  return {
    validOptions: {
      allowedExtensions: sanitizedExtensions,
      maxFileSizeMB: size,
      allowedMimeTypes,
    },
  };
};

// Helper to verify that the form belongs to the authenticated user
const findUserForm = async (formId, userId) => {
  return Form.findOne({
    where: {
      id: formId,
      userId,
    },
  });
};

// POST /api/forms/:formId/fields - Add a question to a form
const createField = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await findUserForm(formId, req.user.id);

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    const { label, type, placeholder, required, options, sortOrder, order } = req.body;

    if (!label || !label.trim() || !type || !type.trim()) {
      return res.status(400).json({
        data: null,
        message: 'Label and type are required',
      });
    }

    const normalizedType = type.trim().toLowerCase();
    let fieldOptions = options || null;

    // Validate file upload configuration if type is 'file'
    if (normalizedType === 'file') {
      const { error: fileErr, validOptions } = validateFileOptions(options);
      if (fileErr) {
        return res.status(400).json({
          data: null,
          message: fileErr,
        });
      }
      fieldOptions = validOptions;
    }

    const fieldOrder = sortOrder !== undefined ? sortOrder : (order !== undefined ? order : 0);

    const field = await FormField.create({
      label: label.trim(),
      type: normalizedType,
      placeholder: placeholder ? placeholder.trim() : null,
      required: Boolean(required),
      options: fieldOptions,
      sortOrder: fieldOrder,
      formId: form.id,
    });

    return res.status(201).json({
      data: field,
      message: 'Field created successfully',
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        data: null,
        message: error.errors[0]?.message || 'Validation failed',
      });
    }

    return res.status(500).json({
      data: null,
      message: 'An error occurred while creating the field',
    });
  }
};

// GET /api/forms/:formId/fields - Get all questions of a form
const getFields = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await findUserForm(formId, req.user.id);

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    const fields = await FormField.findAll({
      where: { formId: form.id },
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    return res.status(200).json({
      data: fields,
      message: 'Fields retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      message: 'An error occurred while retrieving fields',
    });
  }
};

// PUT /api/forms/:formId/fields/:fieldId - Update a question
const updateField = async (req, res) => {
  try {
    const { formId, fieldId } = req.params;
    const form = await findUserForm(formId, req.user.id);

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    const field = await FormField.findOne({
      where: {
        id: fieldId,
        formId: form.id,
      },
    });

    if (!field) {
      return res.status(404).json({
        data: null,
        message: 'Field not found',
      });
    }

    const { label, type, placeholder, required, options, sortOrder, order } = req.body;

    if (label !== undefined) {
      if (!label || !label.trim()) {
        return res.status(400).json({
          data: null,
          message: 'Label cannot be empty',
        });
      }
      field.label = label.trim();
    }

    const targetType = type !== undefined ? type.trim().toLowerCase() : field.type;

    if (type !== undefined) {
      if (!type || !type.trim()) {
        return res.status(400).json({
          data: null,
          message: 'Type cannot be empty',
        });
      }
      field.type = targetType;
    }

    if (placeholder !== undefined) {
      field.placeholder = placeholder ? placeholder.trim() : null;
    }

    if (required !== undefined) {
      field.required = Boolean(required);
    }

    if (options !== undefined) {
      let fieldOptions = options;
      if (targetType === 'file') {
        const { error: fileErr, validOptions } = validateFileOptions(options);
        if (fileErr) {
          return res.status(400).json({
            data: null,
            message: fileErr,
          });
        }
        fieldOptions = validOptions;
      }
      field.options = fieldOptions;
    }

    if (sortOrder !== undefined) {
      field.sortOrder = sortOrder;
    } else if (order !== undefined) {
      field.sortOrder = order;
    }

    await field.save();

    return res.status(200).json({
      data: field,
      message: 'Field updated successfully',
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        data: null,
        message: error.errors[0]?.message || 'Validation failed',
      });
    }

    return res.status(500).json({
      data: null,
      message: 'An error occurred while updating the field',
    });
  }
};

// DELETE /api/forms/:formId/fields/:fieldId - Delete a question
const deleteField = async (req, res) => {
  try {
    const { formId, fieldId } = req.params;
    const form = await findUserForm(formId, req.user.id);

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    const field = await FormField.findOne({
      where: {
        id: fieldId,
        formId: form.id,
      },
    });

    if (!field) {
      return res.status(404).json({
        data: null,
        message: 'Field not found',
      });
    }

    await field.destroy();

    return res.status(200).json({
      data: null,
      message: 'Field deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      message: 'An error occurred while deleting the field',
    });
  }
};

// POST /api/forms/:formId/fields/:fieldId/test-upload - Test upload & validation with cleanup
const testUploadField = async (req, res) => {
  try {
    const { formId, fieldId } = req.params;
    const form = await findUserForm(formId, req.user.id);

    if (!form) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    const field = await FormField.findOne({
      where: {
        id: fieldId,
        formId: form.id,
      },
    });

    if (!field) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        data: null,
        message: 'Field not found',
      });
    }

    if (field.type !== 'file') {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        data: null,
        message: 'This question is not configured for file uploads',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        data: null,
        message: 'No file received for test upload',
      });
    }

    const file = req.file;
    const options = field.options || {};
    const allowedExtensions = options.allowedExtensions || [];
    const maxFileSizeMB = options.maxFileSizeMB || 5;
    const allowedMimeTypes = options.allowedMimeTypes || [];

    // Cleanup helper
    const cleanupTempFile = () => {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          console.error('File cleanup error:', e);
        }
      }
    };

    // 1. Extension check
    const originalName = file.originalname || '';
    const fileExt = originalName.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      cleanupTempFile();
      return res.status(400).json({
        data: null,
        message: `File extension .${fileExt} is not permitted. Allowed extensions: ${allowedExtensions.map((e) => '.' + e).join(', ')}`,
      });
    }

    // 2. MIME type check
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cleanupTempFile();
      return res.status(400).json({
        data: null,
        message: `File MIME type '${file.mimetype}' is not permitted for .${fileExt} files`,
      });
    }

    // 3. File size check
    const maxBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      cleanupTempFile();
      return res.status(400).json({
        data: null,
        message: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of ${maxFileSizeMB} MB`,
      });
    }

    // Always clean up test files from disk immediately
    cleanupTempFile();

    return res.status(200).json({
      data: {
        fieldId: field.id,
        originalName: file.originalname,
        size: file.size,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        mimetype: file.mimetype,
        verified: true,
      },
      message: `File "${file.originalname}" successfully verified against server-side extension, MIME, and size restrictions (Test Mode)`,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    console.error('Test upload error:', error);
    return res.status(500).json({
      data: null,
      message: 'Server error during test file validation',
    });
  }
};

module.exports = {
  createField,
  getFields,
  updateField,
  deleteField,
  testUploadField,
};
