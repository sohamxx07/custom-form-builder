const { Form, FormField } = require('../models');
const { generateUniqueSlug } = require('../utils/generateSlug');

// POST /api/forms - Create a new form
const createForm = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        data: null,
        message: 'Title is required',
      });
    }

    const form = await Form.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      userId: req.user.id,
    });

    return res.status(201).json({
      data: form,
      message: 'Form created successfully',
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
      message: 'An error occurred while creating the form',
    });
  }
};

// GET /api/forms - Get all forms for the authenticated user
const getAllForms = async (req, res) => {
  try {
    const forms = await Form.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      data: forms,
      message: 'Forms retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      message: 'An error occurred while retrieving forms',
    });
  }
};

// GET /api/forms/:id - Get one form belonging to the authenticated user
const getFormById = async (req, res) => {
  try {
    const form = await Form.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    return res.status(200).json({
      data: form,
      message: 'Form retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      message: 'An error occurred while retrieving the form',
    });
  }
};

// PUT /api/forms/:id - Update a form belonging to the authenticated user
const updateForm = async (req, res) => {
  try {
    const form = await Form.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    const { title, description } = req.body;

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          data: null,
          message: 'Title cannot be empty',
        });
      }
      form.title = title.trim();
    }

    if (description !== undefined) {
      form.description = description ? description.trim() : null;
    }

    await form.save();

    return res.status(200).json({
      data: form,
      message: 'Form updated successfully',
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
      message: 'An error occurred while updating the form',
    });
  }
};

// DELETE /api/forms/:id - Delete a form belonging to the authenticated user
const deleteForm = async (req, res) => {
  try {
    const form = await Form.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    await form.destroy();

    return res.status(200).json({
      data: null,
      message: 'Form deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      message: 'An error occurred while deleting the form',
    });
  }
};

// POST /api/forms/:id/test-submit - Test Mode submission validation without saving FormResponse
const testSubmit = async (req, res) => {
  try {
    const form = await Form.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: FormField,
          as: 'fields',
        },
      ],
      order: [[{ model: FormField, as: 'fields' }, 'sortOrder', 'ASC']],
    });

    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    const { answers } = req.body || {};
    const errors = {};
    const fields = form.fields || [];

    for (const field of fields) {
      const val = answers ? answers[field.id] : undefined;

      // Required validation
      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors[field.id] = `"${field.label}" is required.`;
          continue;
        }
      }

      // Format validations
      if (val !== undefined && val !== null && val !== '') {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(val).trim())) {
            errors[field.id] = 'Please enter a valid email address.';
          }
        } else if (field.type === 'number') {
          if (isNaN(Number(val))) {
            errors[field.id] = 'Please enter a valid numeric value.';
          }
        } else if (field.type === 'date') {
          const strVal = String(val).trim();
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          const parsed = new Date(strVal);
          if (!dateRegex.test(strVal) && isNaN(parsed.getTime())) {
            errors[field.id] = `Please enter a valid date for "${field.label}".`;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        data: { errors },
        message: 'Validation failed. Please correct the highlighted errors.',
      });
    }

    return res.status(200).json({
      data: {
        formId: form.id,
        fieldCount: fields.length,
        answers: answers || {},
        testedAt: new Date().toISOString(),
      },
      message: 'Test submission passed! All questions satisfied validations and no database submission record was created.',
    });
  } catch (error) {
    console.error('Test submit error:', error);
    return res.status(500).json({
      data: null,
      message: 'Server error during test submission',
    });
  }
};

// POST /api/forms/:id/publish - Publish a form
const publishForm = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the form belonging to the authenticated user
    const form = await Form.findOne({
      where: {
        id,
        userId: req.user.id,
      },
      include: [
        {
          model: FormField,
          as: 'fields',
        },
      ],
    });

    // 2. Return 404 if form not found or doesn't belong to the user
    if (!form) {
      return res.status(404).json({
        data: null,
        message: 'Form not found',
      });
    }

    // 3. Check that the form contains at least one FormField
    if (!form.fields || form.fields.length === 0) {
      return res.status(400).json({
        data: null,
        message: 'Cannot publish an empty form. Please add at least one field before publishing.',
      });
    }

    // 4. Preserve existing slug if already assigned, otherwise generate a unique slug
    let slug = form.slug;
    if (!slug) {
      slug = await generateUniqueSlug(form.title, Form, form.id);
    }

    // 5. Update form status, slug, and publishedAt
    form.status = 'published';
    form.slug = slug;
    form.publishedAt = new Date();
    await form.save();

    return res.status(200).json({
      data: form,
      message: 'Form published successfully',
    });
  } catch (error) {
    console.error('Publish form error:', error);
    return res.status(500).json({
      data: null,
      message: 'An error occurred while publishing the form',
    });
  }
};

module.exports = {
  createForm,
  getAllForms,
  getFormById,
  updateForm,
  deleteForm,
  testSubmit,
  publishForm,
};
