const { Form, FormField, FormResponse } = require('../models');

// GET /api/forms/:formId/responses - Get all responses for a form belonging to the creator
const getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;

    // 1. Verify form ownership
    const form = await Form.findOne({
      where: {
        id: formId,
        userId: req.user.id,
      },
      include: [
        {
          model: FormField,
          as: 'fields',
          attributes: ['id', 'label', 'type', 'placeholder', 'options', 'sortOrder'],
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

    // 2. Fetch all responses belonging to this form, newest first
    const responses = await FormResponse.findAll({
      where: { formId: form.id },
      order: [['createdAt', 'DESC']],
    });

    const parsedResponses = responses.map((r) => {
      let answersObj = {};
      if (typeof r.answers === 'string') {
        try {
          answersObj = JSON.parse(r.answers);
        } catch (e) {
          answersObj = {};
        }
      } else if (r.answers && typeof r.answers === 'object') {
        answersObj = r.answers;
      }

      return {
        id: r.id,
        formId: r.formId,
        answers: answersObj,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return res.status(200).json({
      data: {
        form: {
          id: form.id,
          title: form.title,
          description: form.description,
          status: form.status,
          slug: form.slug,
          fields: form.fields || [],
        },
        responses: parsedResponses,
        totalCount: parsedResponses.length,
      },
      message: 'Responses retrieved successfully',
    });
  } catch (error) {
    console.error('Get form responses error:', error);
    return res.status(500).json({
      data: null,
      message: 'An error occurred while fetching form responses',
    });
  }
};

// GET /api/forms/:formId/responses/:responseId - Get a single response
const getSingleResponse = async (req, res) => {
  try {
    const { formId, responseId } = req.params;

    // 1. Verify form ownership
    const form = await Form.findOne({
      where: {
        id: formId,
        userId: req.user.id,
      },
      include: [
        {
          model: FormField,
          as: 'fields',
          attributes: ['id', 'label', 'type', 'placeholder', 'options', 'sortOrder'],
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

    // 2. Verify response belongs to this form
    const response = await FormResponse.findOne({
      where: {
        id: responseId,
        formId: form.id,
      },
    });

    if (!response) {
      return res.status(404).json({
        data: null,
        message: 'Response not found',
      });
    }

    let answersObj = {};
    if (typeof response.answers === 'string') {
      try {
        answersObj = JSON.parse(response.answers);
      } catch (e) {
        answersObj = {};
      }
    } else if (response.answers && typeof response.answers === 'object') {
      answersObj = response.answers;
    }

    return res.status(200).json({
      data: {
        form: {
          id: form.id,
          title: form.title,
          description: form.description,
          fields: form.fields || [],
        },
        response: {
          id: response.id,
          formId: response.formId,
          answers: answersObj,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
        },
      },
      message: 'Response retrieved successfully',
    });
  } catch (error) {
    console.error('Get single response error:', error);
    return res.status(500).json({
      data: null,
      message: 'An error occurred while fetching the response',
    });
  }
};

module.exports = {
  getFormResponses,
  getSingleResponse,
};
