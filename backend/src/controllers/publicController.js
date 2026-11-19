const fs = require('fs');
const path = require('path');
const { Form, FormField, FormResponse } = require('../models');

// GET /api/public/forms/:slug - Fetch a published form for respondents
const getPublicFormBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        data: null,
        message: 'Slug parameter is required',
      });
    }

    // 1. Find published form matching the slug
    const form = await Form.findOne({
      where: {
        slug: slug.trim(),
        status: 'published',
      },
      attributes: ['id', 'title', 'description', 'slug', 'publishedAt'],
    });

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found or is currently unpublished',
      });
    }

    // 2. Fetch associated form fields in sorted order
    const fields = await FormField.findAll({
      where: { formId: form.id },
      attributes: ['id', 'label', 'type', 'placeholder', 'required', 'options', 'sortOrder'],
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    // 3. Return sanitized public form details
    return res.status(200).json({
      data: {
        id: form.id,
        title: form.title,
        description: form.description,
        slug: form.slug,
        publishedAt: form.publishedAt,
        fields,
      },
      message: 'Public form fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching public form:', error);
    return res.status(500).json({
      data: null,
      message: 'An error occurred while fetching the form',
    });
  }
};

// POST /api/public/forms/:slug/upload - Upload an actual image or file for a field
const uploadPublicFile = async (req, res) => {
  try {
    const { slug } = req.params;
    const { fieldId } = req.body || {};

    if (!req.file) {
      return res.status(400).json({
        data: null,
        message: 'No file was provided for upload',
      });
    }

    const form = await Form.findOne({
      where: {
        slug: slug.trim(),
        status: 'published',
      },
    });

    if (!form) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        data: null,
        message: 'Form not found or is currently unpublished.',
      });
    }

    let field = null;
    if (fieldId) {
      field = await FormField.findOne({
        where: {
          id: fieldId,
          formId: form.id,
        },
      });
    }

    const file = req.file;
    const originalName = file.originalname || '';
    const ext = originalName.split('.').pop().toLowerCase();
    const isImage =
      ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) ||
      (file.mimetype && file.mimetype.toLowerCase().startsWith('image/'));

    // Validate against configured field options if field is specified
    if (field && field.options) {
      const allowedExts = field.options.allowedExtensions || [];
      const maxMB = field.options.maxFileSizeMB;

      if (Array.isArray(allowedExts) && allowedExts.length > 0) {
        const lowerAllowed = allowedExts.map((e) => String(e).toLowerCase().replace(/^\./, ''));
        if (!lowerAllowed.includes(ext)) {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          return res.status(400).json({
            data: null,
            message: `File extension .${ext} is not permitted for "${field.label}". Allowed: ${allowedExts.join(', ')}.`,
          });
        }
      }

      if (maxMB && file.size > maxMB * 1024 * 1024) {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({
          data: null,
          message: `File size exceeds the maximum limit of ${maxMB} MB.`,
        });
      }
    }

    // Return stored file path & relative URL (accessible via static uploads route)
    const filePayload = {
      fileName: file.originalname,
      originalName: file.originalname,
      storedName: file.filename,
      path: `/uploads/${file.filename}`,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      isImage,
    };

    return res.status(200).json({
      data: filePayload,
      message: `${isImage ? 'Image' : 'File'} uploaded and saved successfully`,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    console.error('Error uploading public file:', error);
    return res.status(500).json({
      data: null,
      message: 'An error occurred while uploading the file.',
    });
  }
};

// POST /api/public/forms/:slug/submit - Submit answers to a published form
const submitPublicForm = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        data: null,
        message: 'Slug parameter is required',
      });
    }

    // 1. Find form using its slug
    const form = await Form.findOne({
      where: {
        slug: slug.trim(),
      },
    });

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    // 2. Accept submissions only when the form status is published
    if (form.status !== 'published') {
      return res.status(400).json({
        data: null,
        message: 'This form is currently unpublished and is not accepting submissions.',
      });
    }

    // 3. Fetch all form fields configured for this form
    const fields = await FormField.findAll({
      where: { formId: form.id },
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    // Parse submitted answers (handle JSON body or multipart form fields)
    let submittedAnswers = {};
    if (req.body?.answers) {
      if (typeof req.body.answers === 'string') {
        try {
          submittedAnswers = JSON.parse(req.body.answers);
        } catch (e) {
          submittedAnswers = {};
        }
      } else if (typeof req.body.answers === 'object') {
        submittedAnswers = { ...req.body.answers };
      }
    }

    // If files were directly included in a multipart submission:
    if (Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        const match = file.fieldname.match(/^(?:field_|file_)?(\d+)$/);
        const fieldId = match ? match[1] : file.fieldname;
        const ext = (file.originalname || '').split('.').pop().toLowerCase();
        const isImage =
          ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) ||
          (file.mimetype && file.mimetype.toLowerCase().startsWith('image/'));

        submittedAnswers[fieldId] = {
          fileName: file.originalname,
          originalName: file.originalname,
          storedName: file.filename,
          path: `/uploads/${file.filename}`,
          url: `/uploads/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
          isImage,
        };
      });
    }

    // 4. Validate submitted field IDs and ensure they belong to this form
    const validFieldMap = new Map();
    fields.forEach((f) => {
      validFieldMap.set(String(f.id), f);
    });

    for (const submittedKey of Object.keys(submittedAnswers)) {
      if (!validFieldMap.has(String(submittedKey))) {
        return res.status(400).json({
          data: null,
          message: `Invalid field submitted: Field ID ${submittedKey} does not belong to this form.`,
        });
      }
    }

    // 5. Validate required fields and field types / options
    const errors = {};
    const sanitizedAnswers = {};

    for (const field of fields) {
      const fieldKey = String(field.id);
      const rawVal =
        submittedAnswers[fieldKey] !== undefined
          ? submittedAnswers[fieldKey]
          : submittedAnswers[field.id];

      const isMissing =
        rawVal === undefined ||
        rawVal === null ||
        rawVal === '' ||
        (Array.isArray(rawVal) && rawVal.length === 0);

      // Validate required fields
      if (field.required && isMissing) {
        errors[field.id] = `"${field.label}" is required.`;
        continue;
      }

      if (isMissing) {
        sanitizedAnswers[field.id] = null;
        continue;
      }

      // Format & option validations based on field type
      const val = rawVal;

      switch (field.type) {
        case 'text':
        case 'textarea': {
          sanitizedAnswers[field.id] = typeof val === 'string' ? val.trim() : String(val);
          break;
        }

        case 'email': {
          const strVal = String(val).trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(strVal)) {
            errors[field.id] = `Please enter a valid email address for "${field.label}".`;
          } else {
            sanitizedAnswers[field.id] = strVal;
          }
          break;
        }

        case 'number': {
          const num = Number(val);
          if (isNaN(num) || String(val).trim() === '') {
            errors[field.id] = `Please enter a valid numeric value for "${field.label}".`;
          } else {
            sanitizedAnswers[field.id] = num;
          }
          break;
        }

        case 'date': {
          const strVal = String(val).trim();
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          const parsed = new Date(strVal);
          if (!dateRegex.test(strVal) && isNaN(parsed.getTime())) {
            errors[field.id] = `Please enter a valid date (YYYY-MM-DD) for "${field.label}".`;
          } else {
            sanitizedAnswers[field.id] = strVal;
          }
          break;
        }

        case 'select':
        case 'radio': {
          const strVal = String(val).trim();
          const validOptions = Array.isArray(field.options) ? field.options.map(String) : [];
          if (validOptions.length > 0 && !validOptions.includes(strVal)) {
            errors[field.id] = `Selected option "${strVal}" for "${field.label}" is not a valid choice.`;
          } else {
            sanitizedAnswers[field.id] = strVal;
          }
          break;
        }

        case 'checkbox': {
          let selected = Array.isArray(val) ? val : [val];
          selected = selected.map(String);
          const validOptions = Array.isArray(field.options) ? field.options.map(String) : [];
          if (validOptions.length > 0) {
            const invalidChoices = selected.filter((s) => !validOptions.includes(s));
            if (invalidChoices.length > 0) {
              errors[field.id] = `Invalid selection [${invalidChoices.join(', ')}] for "${field.label}".`;
            } else {
              sanitizedAnswers[field.id] = selected;
            }
          } else {
            sanitizedAnswers[field.id] = selected;
          }
          break;
        }

        case 'file': {
          let fileMeta = val;
          const fileName =
            typeof val === 'object' && val !== null
              ? val.fileName || val.originalName || val.name
              : String(val).trim();

          const fileOpts = field.options || {};
          const allowedExts = fileOpts.allowedExtensions || [];
          const maxMB = fileOpts.maxFileSizeMB;

          if (fileName && Array.isArray(allowedExts) && allowedExts.length > 0) {
            const ext = fileName.split('.').pop().toLowerCase();
            const lowerAllowed = allowedExts.map((e) => String(e).toLowerCase().replace(/^\./, ''));
            if (!lowerAllowed.includes(ext)) {
              errors[field.id] = `File extension .${ext} is not permitted for "${field.label}". Allowed: ${allowedExts.join(', ')}.`;
            }
          }

          if (typeof val === 'object' && val !== null && val.size && maxMB) {
            const maxBytes = maxMB * 1024 * 1024;
            if (val.size > maxBytes) {
              errors[field.id] = `File size exceeds the maximum limit of ${maxMB} MB.`;
            }
          }

          // Ensure isImage is accurately flagged
          if (typeof val === 'object' && val !== null) {
            const ext = (fileName || '').split('.').pop().toLowerCase();
            const isImage =
              ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) ||
              (val.mimetype && val.mimetype.toLowerCase().startsWith('image/'));

            fileMeta = {
              ...val,
              isImage: isImage || Boolean(val.isImage),
            };
          }

          sanitizedAnswers[field.id] = fileMeta;
          break;
        }

        default:
          sanitizedAnswers[field.id] = val;
          break;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        data: { errors },
        message: 'Validation failed. Please correct the highlighted errors.',
      });
    }

    // 6. Save response in database (saving JSON answers, NOT binary data)
    const formResponse = await FormResponse.create({
      formId: form.id,
      answers: sanitizedAnswers,
    });

    return res.status(201).json({
      data: {
        id: formResponse.id,
        formId: formResponse.formId,
        answers: formResponse.answers,
        submittedAt: formResponse.createdAt,
      },
      message: 'Response submitted successfully! Thank you for your feedback.',
    });
  } catch (error) {
    console.error('Error submitting public form:', error);
    return res.status(500).json({
      data: null,
      message: 'An error occurred while submitting your response. Please try again.',
    });
  }
};

module.exports = {
  getPublicFormBySlug,
  uploadPublicFile,
  submitPublicForm,
};
