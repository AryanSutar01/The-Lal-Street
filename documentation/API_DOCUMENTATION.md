## 4. API Documentation

### 4.1 Base URL

**Production Backend:** `https://the-lal-street-1.onrender.com/api`  
**Local Development:** `http://localhost:5000/api`

### 4.2 Authentication

**Admin Authentication:**
- Uses password-based authentication
- Password stored in environment variable (`ADMIN_PASSWORD`)
- JWT token generated on successful login
- Token included in `Authorization` header: `Bearer <token>`
- Protected endpoints: POST, PUT, DELETE on `/api/suggested-buckets`

**Token Flow:**
1. Admin enters password in frontend
2. Frontend sends password to backend
3. Backend validates password against `ADMIN_PASSWORD`
4. Backend generates JWT token
5. Token stored in localStorage
6. Token included in subsequent admin API requests

### 4.3 API Endpoints

#### 4.3.1 Health Check

**GET** `/api/health`

**Description:** Check server health and status

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "message": "Backend server is running successfully!",
  "uptime": "3600s",
  "timestamp": "2024-11-28T12:00:00.000Z",
  "memory": {
    "heapUsed": "45MB",
    "heapTotal": "60MB",
    "rss": "120MB"
  },
  "stats": {
    "totalRequests": 150,
    "errorCount": 2,
    "successRate": "98.67%"
  }
}
```

**Use Cases:**
- Server warm-up mechanism
- Health monitoring
- Load detection

---

#### 4.3.2 Fund Search

**GET** `/api/funds/search`

**Description:** Search for mutual funds by name or scheme code

**Authentication:** Not required

**Query Parameters:**
- `q` (string, required) - Search query

**Example Request:**
```
GET /api/funds/search?q=hdfc
```

**Response:**
```json
[
  {
    "schemeCode": "119551",
    "schemeName": "HDFC Equity Fund - Growth",
    "category": "Equity",
    "fundHouse": "HDFC Mutual Fund"
  },
  {
    "schemeCode": "120503",
    "schemeName": "HDFC Top 100 Fund - Growth",
    "category": "Equity",
    "fundHouse": "HDFC Mutual Fund"
  }
]
```

**Error Responses:**
- `400 Bad Request` - Missing query parameter
- `500 Internal Server Error` - Server error

**Rate Limit:** 100 requests per 15 minutes per IP

---

#### 4.3.3 Get NAV Data (Bucket)

**POST** `/api/funds/get-nav-bucket`

**Description:** Fetch historical NAV (Net Asset Value) data for multiple funds

**Authentication:** Not required

**Request Body:**
```json
{
  "schemeCodes": ["119551", "120503", "119552"]
}
```

**Request Body Schema:**
- `schemeCodes` (array of strings, required) - Array of fund scheme codes
  - Maximum 20 funds per request
  - Minimum 1 fund required

**Example Request:**
```bash
POST /api/funds/get-nav-bucket
Content-Type: application/json

{
  "schemeCodes": ["119551", "120503"]
}
```

**Response:**
```json
[
  {
    "schemeCode": "119551",
    "schemeName": "HDFC Equity Fund - Growth",
    "navData": [
      {
        "date": "2024-11-28",
        "nav": 1250.45
      },
      {
        "date": "2024-11-27",
        "nav": 1248.30
      }
    ],
    "meta": {
      "scheme_start_date": "2000-01-01",
      "scheme_end_date": "2024-11-28"
    }
  }
]
```

**Response Schema:**
- `schemeCode` (string) - Fund scheme code
- `schemeName` (string) - Fund name
- `navData` (array) - Array of NAV entries
  - `date` (string, YYYY-MM-DD) - NAV date
  - `nav` (number) - Net Asset Value
- `meta` (object) - Fund metadata
  - `scheme_start_date` (string) - Earliest available NAV date
  - `scheme_end_date` (string) - Latest available NAV date

**Error Responses:**
- `400 Bad Request` - Missing or invalid schemeCodes array
- `400 Bad Request` - More than 20 funds requested
- `503 Service Unavailable` - External NAV API unavailable
- `500 Internal Server Error` - Server error

**Rate Limit:** 100 requests per 15 minutes per IP

**Notes:**
- NAV data is cached for performance
- Data fetched from MFAPI (api.mfapi.in)
- Returns data in descending date order (newest first)

---

#### 4.3.4 SIP Calculation

**POST** `/api/calculator/sip`

**Description:** Calculate SIP (Systematic Investment Plan) returns for a portfolio

**Authentication:** Not required

**Request Body:**
```json
{
  "funds": [
    {
      "schemeCode": "119551",
      "weightage": 50
    },
    {
      "schemeCode": "120503",
      "weightage": 50
    }
  ],
  "monthlyInvestment": 10000,
  "startDate": "2020-01-01",
  "endDate": "2024-11-28"
}
```

**Request Body Schema:**
- `funds` (array, required) - Array of fund objects
  - `schemeCode` (string, required) - Fund scheme code
  - `weightage` (number, required) - Portfolio weight (must total 100)
- `monthlyInvestment` (number, required) - Monthly SIP amount
- `startDate` (string, required, YYYY-MM-DD) - SIP start date
- `endDate` (string, required, YYYY-MM-DD) - Calculation end date

**Response:**
```json
{
  "totalInvested": 580000,
  "currentValue": 850000,
  "absoluteProfit": 270000,
  "absoluteProfitPercent": 46.55,
  "cagr": 12.5,
  "xirr": 13.2,
  "fundBreakdown": [...],
  "monthlyData": [...]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input validation
- `503 Service Unavailable` - NAV data unavailable
- `500 Internal Server Error` - Calculation error

**Rate Limit:** 20 requests per 5 minutes per IP

---

#### 4.3.5 Rolling Returns

**POST** `/api/calculator/rolling-returns`

**Description:** Calculate rolling returns for one or more funds

**Authentication:** Not required

**Request Body:**
```json
{
  "schemeCodes": ["119551"],
  "windowDays": 365
}
```

**Request Body Schema:**
- `schemeCodes` (array, required) - Array of fund scheme codes
- `windowDays` (number, required) - Rolling window size in days

**Response:**
```json
{
  "windowDays": 365,
  "results": [
    {
      "schemeCode": "119551",
      "schemeName": "HDFC Equity Fund",
      "rollingReturns": [...],
      "statistics": {
        "mean": 12.5,
        "median": 12.0,
        "max": 18.5,
        "min": 5.2,
        "stdDev": 3.2
      }
    }
  ],
  "summary": {
    "totalSchemes": 1,
    "successfulSchemes": 1,
    "failedSchemes": 0
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input validation
- `503 Service Unavailable` - NAV data unavailable
- `500 Internal Server Error` - Calculation error

**Rate Limit:** 20 requests per 5 minutes per IP

---

#### 4.3.6 Get All Suggested Buckets

**GET** `/api/suggested-buckets`

**Description:** Get all suggested investment buckets

**Authentication:** Not required

**Query Parameters:**
- `activeOnly` (boolean, optional) - Filter only active buckets (default: false)

**Example Request:**
```
GET /api/suggested-buckets?activeOnly=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "name": "Conservative Portfolio",
      "description": "Low-risk portfolio for stable returns",
      "category": "investment",
      "riskLevel": "low",
      "funds": [...],
      "performance": {...},
      "isActive": true,
      "createdAt": "2024-11-28T10:00:00.000Z",
      "updatedAt": "2024-11-28T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error

---

#### 4.3.7 Get Suggested Bucket by ID

**GET** `/api/suggested-buckets/:id`

**Description:** Get a single suggested bucket by ID

**Authentication:** Not required

**Path Parameters:**
- `id` (string, required) - Bucket UUID

**Example Request:**
```
GET /api/suggested-buckets/uuid-123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Conservative Portfolio",
    ...
  }
}
```

**Error Responses:**
- `404 Not Found` - Bucket not found
- `500 Internal Server Error` - Server error

---

#### 4.3.8 Create Suggested Bucket (Admin Only)

**POST** `/api/suggested-buckets`

**Description:** Create a new suggested investment bucket

**Authentication:** Required (Admin token)

**Request Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Aggressive Growth Portfolio",
  "description": "High-risk, high-return portfolio",
  "category": "investment",
  "riskLevel": "high",
  "funds": [
    {
      "id": "119551",
      "name": "HDFC Equity Fund",
      "weightage": 50
    },
    {
      "id": "120503",
      "name": "HDFC Top 100 Fund",
      "weightage": 50
    }
  ]
}
```

**Request Body Schema:**
- `name` (string, required) - Bucket name
- `description` (string, optional) - Bucket description
- `category` (string, required) - "investment" | "retirement" | "both"
- `riskLevel` (string, required) - "low" | "moderate" | "high"
- `funds` (array, required) - Array of fund objects
  - `id` (string, required) - Fund scheme code
  - `name` (string, required) - Fund name
  - `weightage` (number, required) - Portfolio weight (must total 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid-456",
    "name": "Aggressive Growth Portfolio",
    ...
  },
  "message": "Suggested bucket created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid data
- `401 Unauthorized` - Invalid or missing admin token
- `500 Internal Server Error` - Server error

---

#### 4.3.9 Update Suggested Bucket (Admin Only)

**PUT** `/api/suggested-buckets/:id`

**Description:** Update an existing suggested bucket

**Authentication:** Required (Admin token)

**Path Parameters:**
- `id` (string, required) - Bucket UUID

**Request Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Portfolio Name",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Updated Portfolio Name",
    ...
  },
  "message": "Suggested bucket updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Invalid or missing admin token
- `404 Not Found` - Bucket not found
- `500 Internal Server Error` - Server error

**Notes:**
- Cannot update `id` or `createdAt` fields
- Performance will be recalculated if funds are changed

---

#### 4.3.10 Delete Suggested Bucket (Admin Only)

**DELETE** `/api/suggested-buckets/:id`

**Description:** Delete a suggested bucket permanently

**Authentication:** Required (Admin token)

**Path Parameters:**
- `id` (string, required) - Bucket UUID

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Suggested bucket deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing admin token
- `404 Not Found` - Bucket not found
- `500 Internal Server Error` - Server error

**Notes:**
- This action cannot be undone
- Bucket is permanently removed from storage

---

### 4.4 Error Codes

**HTTP Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not supported
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - External service unavailable

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

---

### 4.5 Rate Limiting

**General API Routes:**
- Limit: 100 requests per 15 minutes per IP
- Applies to: All `/api/*` routes except health check

**Calculator Routes:**
- Limit: 20 requests per 5 minutes per IP
- Applies to: `/api/calculator/*` routes

**Rate Limit Headers:**
Response includes rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701172800
```

**Rate Limit Exceeded Response:**
```json
{
  "status": 429,
  "message": "Too many requests from this IP, please try again after 15 minutes."
}
```

---

### 4.6 CORS Configuration

**Allowed Origins:**
- Production frontend URL (Vercel)
- Local development URLs: `http://localhost:5173`, `http://localhost:3000`
- Configured via `ALLOWED_ORIGINS` environment variable

**CORS Headers:**
- `Access-Control-Allow-Origin`: Configured origins
- `Access-Control-Allow-Methods`: GET, POST, PUT, DELETE, OPTIONS
- `Access-Control-Allow-Headers`: Content-Type, Authorization
- `Access-Control-Allow-Credentials`: true

---

### 4.7 External API Integration

**MFAPI (NAV Data):**
- Base URL: `https://api.mfapi.in/mf/`
- Endpoint: `/{schemeCode}`
- Returns: Historical NAV data for a fund
- Caching: Implemented via LRU cache (1 hour TTL)
- Retry Logic: 3 retries with exponential backoff

**RapidAPI (Fund Search):**
- Used for fund metadata and search
- Returns: Fund names, scheme codes, categories

**Timeout:**
- NAV API requests: 10 seconds timeout
- Total request timeout: 30 seconds (for serverless functions)


