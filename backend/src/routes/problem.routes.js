const express = require('express');
const problemController = require('../controllers/problem.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

router.get('/', asyncHandler(problemController.list));
router.get('/:slug', asyncHandler(problemController.getBySlug));
router.post('/', authenticate, requireAdmin, asyncHandler(problemController.create));

module.exports = router;
