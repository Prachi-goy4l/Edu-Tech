const express = require('express');
const submissionController = require('../controllers/submission.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

router.get('/languages', asyncHandler(submissionController.languages));
router.post('/run', asyncHandler(submissionController.run));
router.post('/', authenticate, asyncHandler(submissionController.submit));
router.get('/', authenticate, asyncHandler(submissionController.history));
router.get('/admin', authenticate, requireAdmin, asyncHandler(submissionController.adminHistory));
router.get('/:id', authenticate, asyncHandler(submissionController.getById));

module.exports = router;
