// api/suggested-buckets/index.js - Serverless function for suggested buckets
const {
  handleGetAllBuckets,
  handleGetBucketById,
  handleCreateBucket,
  handleUpdateBucket,
  handleDeleteBucket,
} = require('../../server/controllers/suggestedBuckets.controller');
const { checkAdminAuth } = require('../../server/middleware/auth');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse URL to get ID if present
    const urlParts = req.url.split('/').filter(p => p);
    const bucketIndex = urlParts.indexOf('suggested-buckets');
    const id = bucketIndex >= 0 && urlParts[bucketIndex + 1] ? urlParts[bucketIndex + 1] : null;

    // Create a mock req object with params for handlers
    const mockReq = {
      ...req,
      params: id ? { id } : {},
      query: req.query || {},
      body: req.body || {},
    };

    // Route handling
    if (req.method === 'GET') {
      if (id) {
        return await handleGetBucketById(mockReq, res);
      } else {
        return await handleGetAllBuckets(mockReq, res);
      }
    } else if (req.method === 'POST') {
      // Check auth before creating
      return checkAdminAuth(mockReq, res, async () => {
        await handleCreateBucket(mockReq, res);
      });
    } else if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Bucket ID is required',
        });
      }
      // Check auth before updating
      return checkAdminAuth(mockReq, res, async () => {
        await handleUpdateBucket(mockReq, res);
      });
    } else if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Bucket ID is required',
        });
      }
      // Check auth before deleting
      return checkAdminAuth(mockReq, res, async () => {
        await handleDeleteBucket(mockReq, res);
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('[Suggested Buckets API] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

