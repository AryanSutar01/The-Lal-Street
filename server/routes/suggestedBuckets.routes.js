// server/routes/suggestedBuckets.routes.js
const express = require('express');
const router = express.Router();
const {
  handleGetAllBuckets,
  handleGetBucketById,
  handleCreateBucket,
  handleUpdateBucket,
  handleDeleteBucket,
} = require('../controllers/suggestedBuckets.controller');
const { checkAdminAuth } = require('../middleware/auth');

// Public routes (no auth required)
router.get('/', handleGetAllBuckets);
router.get('/:id', handleGetBucketById);

// Admin routes (require authentication)
router.post('/', checkAdminAuth, handleCreateBucket);
router.put('/:id', checkAdminAuth, handleUpdateBucket);
router.delete('/:id', checkAdminAuth, handleDeleteBucket);

module.exports = router;

