## 5. Admin Panel Guide

### 5.1 Admin Login

**Access URL:** `yourwebsite.com/#admin`

**Alternative Access Methods:**
1. Direct URL hash: Add `#admin` to your website URL
2. Browser console: Run `window.location.hash = 'admin'`
3. Hidden button: Bottom right corner of home page (2% opacity)

**Login Process:**
1. Navigate to admin URL
2. Enter admin password (configured in `ADMIN_PASSWORD` environment variable)
3. Click "Login"
4. Token stored in browser localStorage
5. Redirected to admin dashboard

**Security Notes:**
- Password is never stored in frontend code
- Password must match `ADMIN_PASSWORD` on backend server
- Token expires after session (can be configured)

---

### 5.2 Dashboard Overview

**Main Features:**
- View all suggested buckets
- Create new buckets
- Edit existing buckets
- Delete buckets
- Activate/Deactivate buckets

**Dashboard Layout:**
- Header with admin controls
- Bucket list/table view
- Create/Edit form modal
- Performance calculation status

---

### 5.3 How to Add/Edit/Delete Content

#### 5.3.1 Creating a Suggested Bucket

**Steps:**
1. Click "Create New Bucket" button
2. Fill in required fields:
   - **Name:** Portfolio name (e.g., "Conservative Portfolio")
   - **Description:** Brief description (optional)
   - **Category:** Select from dropdown
     - Investment
     - Retirement
     - Both
   - **Risk Level:** Select from dropdown
     - Low
     - Moderate
     - High
3. Add Funds:
   - Click "Add Fund" button
   - Search for fund by name or scheme code
   - Select fund from search results
   - Enter weightage percentage (must total 100%)
   - Add up to 5 funds
4. Click "Create & Calculate Performance"
5. System automatically:
   - Validates fund data
   - Fetches NAV data
   - Calculates 3-year rolling returns
   - Saves bucket to database

**Performance Calculation:**
- Automatic upon bucket creation
- Uses latest fund launch date to today
- Daily lumpsum strategy
- 1095 days (3 years) rolling window
- Calculates: mean, median, max, min, std dev, positive periods %

**Validation Rules:**
- Name: Required, max 200 characters
- Funds: Minimum 1, maximum 5
- Weightages: Must total exactly 100%
- All funds must have valid scheme codes

---

#### 5.3.2 Editing a Suggested Bucket

**Steps:**
1. Click "Edit" button on bucket card/row
2. Modify fields as needed:
   - Name, description, category, risk level
   - Add/remove funds
   - Update weightages
3. Click "Save Changes"
4. If funds changed, performance is automatically recalculated

**Performance Recalculation:**
- Triggered automatically when funds list changes
- Can take 10-30 seconds depending on data
- Shows loading indicator during calculation

**Notes:**
- Cannot change `id` or `createdAt` fields
- `updatedAt` timestamp is automatically updated
- Performance data is preserved if funds unchanged

---

#### 5.3.3 Deleting a Suggested Bucket

**Steps:**
1. Click "Delete" button on bucket card/row
2. Confirm deletion in dialog
3. Bucket is permanently removed

**Warning:**
- This action cannot be undone
- Bucket will be removed from all displays
- Associated performance data is deleted

---

#### 5.3.4 Activating/Deactivating Buckets

**Purpose:** Control which buckets appear on home page

**Steps:**
1. Toggle "Active" switch on bucket
2. Active buckets appear in "Recommended Portfolios" section
3. Inactive buckets remain in admin panel but hidden from users

**Use Cases:**
- Temporarily hide buckets without deleting
- Seasonal portfolio recommendations
- Testing new portfolios before public release

---

### 5.4 File Upload Guidelines

**Note:** The Lal Street does not currently support file uploads. All data is managed through the admin interface:

- Funds: Added via search (uses external API)
- Performance data: Calculated automatically
- Bucket metadata: Entered via forms

**Future Considerations:**
- CSV import for bulk bucket creation
- Image uploads for bucket thumbnails
- Export buckets as JSON

---

### 5.5 Performance Calculation Details

#### 5.5.1 Calculation Parameters

**Rolling Window:** 3 years (1095 days)
**Method:** Daily Lumpsum
**Date Range:** Latest fund launch date to today
**Frequency:** Daily rolling (one calculation per day)

#### 5.5.2 Metrics Calculated

**Bucket-Level:**
- Mean return (%)
- Median return (%)
- Maximum return (%)
- Minimum return (%)
- Standard deviation (%)
- Positive periods (%)

**Fund-Level:**
- Same metrics for each individual fund
- Weighted portfolio calculations

#### 5.5.3 Auto-Recalculation

**Trigger Conditions:**
- Automatic every 5 days (if server not under load)
- When bucket is edited (funds changed)
- Manual trigger from admin panel

**Server Load Detection:**
- Checks server memory usage
- Skips if memory usage > 80%
- Non-blocking background process

**Recalculation Process:**
1. Check server health
2. Verify last calculation date
3. Fetch latest NAV data
4. Calculate rolling returns
5. Update bucket performance data
6. Update `lastCalculationDate` timestamp

---

### 5.6 Best Practices

**Bucket Naming:**
- Use clear, descriptive names
- Include risk level in name (optional)
- Keep names under 50 characters

**Fund Selection:**
- Include 2-5 funds for diversification
- Ensure funds have sufficient history (3+ years)
- Balance across fund categories

**Weightage Distribution:**
- Ensure total equals exactly 100%
- Distribute based on risk tolerance
- Consider fund correlation

**Performance Review:**
- Review metrics before activating
- Monitor performance over time
- Update buckets when needed

---

### 5.7 Troubleshooting Admin Issues

**Issue: Cannot Login**
- **Cause:** Wrong password or missing `ADMIN_PASSWORD` env variable
- **Solution:** Verify password matches backend environment variable

**Issue: Performance Calculation Fails**
- **Cause:** Insufficient NAV data or invalid fund codes
- **Solution:** Check fund launch dates, verify scheme codes are valid

**Issue: Buckets Not Appearing on Home Page**
- **Cause:** Bucket is inactive or server error
- **Solution:** Check `isActive` status, verify server logs

**Issue: Token Expired**
- **Cause:** Session timeout or cleared localStorage
- **Solution:** Re-login to admin panel

---

### 5.8 Admin API Endpoints Summary

**Public Endpoints (No Auth):**
- `GET /api/suggested-buckets` - View all buckets
- `GET /api/suggested-buckets/:id` - View single bucket

**Protected Endpoints (Admin Auth Required):**
- `POST /api/suggested-buckets` - Create bucket
- `PUT /api/suggested-buckets/:id` - Update bucket
- `DELETE /api/suggested-buckets/:id` - Delete bucket

**Authentication:**
- Password: Stored in `ADMIN_PASSWORD` environment variable
- Token: JWT token in `Authorization` header
- Token Storage: Browser localStorage


