# Suggested Buckets - Server-Side Storage Migration

## Overview
Suggested buckets have been migrated from client-side `localStorage` to server-side storage. This ensures buckets are accessible across all devices and browsers.

## Changes Made

### 1. Server-Side Storage
- **File**: `server/services/suggestedBuckets.service.js`
- **Storage**: JSON file at `data/suggestedBuckets.json`
- **Features**: Automatic file creation, error handling, data persistence

### 2. API Endpoints
- **GET** `/api/suggested-buckets` - Get all buckets (public)
- **GET** `/api/suggested-buckets/:id` - Get single bucket (public)
- **POST** `/api/suggested-buckets` - Create bucket (admin only)
- **PUT** `/api/suggested-buckets/:id` - Update bucket (admin only)
- **DELETE** `/api/suggested-buckets/:id` - Delete bucket (admin only)

### 3. Authentication
- Admin operations require authentication token
- Token sent via `Authorization: Bearer <token>` header
- Uses `ADMIN_PASSWORD` or `VITE_ADMIN_PASSWORD` environment variable

### 4. Client-Side Updates
- Created `client/src/services/suggestedBucketsService.ts` for API calls
- Updated `client/src/data/suggestedBuckets.ts` to use API instead of localStorage
- Added client-side caching (5-minute TTL) to reduce API calls
- Updated all components to use async/await for API calls

## File Structure

```
server/
  ├── services/
  │   └── suggestedBuckets.service.js  (Storage service)
  ├── controllers/
  │   └── suggestedBuckets.controller.js  (Request handlers)
  ├── middleware/
  │   └── auth.js  (Admin authentication)
  └── routes/
      └── suggestedBuckets.routes.js  (Route definitions)

api/
  └── suggested-buckets/
      └── index.js  (Vercel serverless function)

data/
  └── suggestedBuckets.json  (Storage file - auto-created)

client/src/
  ├── services/
  │   └── suggestedBucketsService.ts  (API client)
  └── data/
      └── suggestedBuckets.ts  (Wrapper for backward compatibility)
```

## Usage

### Reading Buckets (Public)
```typescript
import { loadSuggestedBuckets } from '../data/suggestedBuckets';

// Get all buckets
const allBuckets = await loadSuggestedBuckets(false);

// Get only active buckets
const activeBuckets = await loadSuggestedBuckets(true);
```

### Admin Operations (Requires Authentication)
```typescript
import { 
  addSuggestedBucket, 
  updateSuggestedBucket, 
  deleteSuggestedBucket 
} from '../data/suggestedBuckets';

// Create bucket
await addSuggestedBucket(newBucket);

// Update bucket
await updateSuggestedBucket(bucketId, updates);

// Delete bucket
await deleteSuggestedBucket(bucketId);
```

## Environment Variables

Add to your `.env` file or Vercel environment variables:

```env
ADMIN_PASSWORD=your_secure_password_here
# OR
VITE_ADMIN_PASSWORD=your_secure_password_here
```

## Deployment Notes

1. **Data Directory**: The `data/` directory will be automatically created on first use
2. **File Permissions**: Ensure the server has write permissions for the data directory
3. **Backup**: Consider backing up `data/suggestedBuckets.json` regularly
4. **Vercel**: For Vercel deployments, you may need to use external storage (S3, database) as filesystem writes are ephemeral

## Migration from localStorage

**Old code (localStorage):**
```typescript
const buckets = loadSuggestedBuckets(); // Synchronous
```

**New code (API):**
```typescript
const buckets = await loadSuggestedBuckets(false); // Async
```

## Benefits

✅ **Cross-device access** - Buckets visible on all devices  
✅ **Data persistence** - Survives browser cache clearing  
✅ **Centralized management** - Single source of truth  
✅ **Authentication** - Admin operations are protected  
✅ **Caching** - Client-side cache reduces API calls  

## Next Steps (Optional Improvements)

1. **Database Migration**: Move from JSON file to PostgreSQL/MongoDB for production
2. **JWT Tokens**: Implement proper JWT authentication instead of password tokens
3. **Backup System**: Add automatic backups for bucket data
4. **Versioning**: Add version history for bucket changes

