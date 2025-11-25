# Admin Access Guide

## How to Access Admin Panel

The admin panel is available but not shown in the main navigation for security. Here are the ways to access it:

### Method 1: URL Hash (Recommended)
Simply add `#admin` to your URL:
```
http://localhost:5173/#admin
```

Or in production:
```
https://your-domain.com/#admin
```

### Method 2: Browser Console
Open browser console (F12) and run:
```javascript
window.location.hash = 'admin';
```

### Method 3: Direct Navigation (For Development)
If you want to add a visible link during development, you can:

1. **Add to Navigation** (temporary for development):
   Edit `client/src/components/Navigation.tsx` and add:
   ```tsx
   { id: 'admin', label: 'Admin', icon: Shield }
   ```

2. **Add Button on Home Page** (temporary for development):
   Edit `client/src/components/HomePage.tsx` and add a button in the footer or header.

## Admin Panel Features

Once accessed, the admin panel allows you to:

1. **Create Suggested Buckets**
   - Name and describe your bucket
   - Select category (Investment, Retirement, or Both)
   - Set risk level (Low, Moderate, High)
   - Add 1-5 funds with weightages
   - Automatically calculate performance metrics

2. **Manage Buckets**
   - View all created buckets
   - Edit existing buckets
   - Delete buckets
   - Activate/Deactivate buckets (only active buckets show on Home page)

3. **Performance Calculation**
   - Rolling returns calculated automatically
   - Analysis from earliest available date
   - Individual fund and portfolio statistics

## Security Recommendations

For production, consider:

1. **Add Authentication**
   ```tsx
   // In AdminPage.tsx
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   
   useEffect(() => {
     // Check for admin token or session
     const token = localStorage.getItem('adminToken');
     if (token && validateToken(token)) {
       setIsAuthenticated(true);
     } else {
       // Redirect or show login form
       setIsAuthenticated(false);
     }
   }, []);
   ```

2. **Environment-Based Access**
   ```tsx
   // Only allow in development
   const isAdminAccessible = import.meta.env.DEV || 
     window.location.hash === '#admin-secret-key';
   ```

3. **Password Protection**
   - Add a simple password check before showing admin interface
   - Store password hash in environment variables

4. **API-Based Admin**
   - Move admin interface to separate route
   - Protect with server-side authentication
   - Use JWT tokens or session-based auth

## Testing the Feature

1. **Access Admin Panel**
   - Navigate to `http://localhost:5173/#admin`

2. **Create a Test Bucket**
   - Click "Create Bucket"
   - Add name: "Test Portfolio"
   - Select funds (search and add 2-3 funds)
   - Set weightages (must total 100%)
   - Click "Create & Calculate Performance"
   - Wait for calculation (may take a few seconds)

3. **Verify on Home Page**
   - Navigate back to Home page
   - Scroll to "Recommended Portfolios" section
   - Your bucket should appear there

4. **Test Import**
   - Click "Investment" or "Retirement" button on bucket card
   - Funds should be imported to respective page

## Troubleshooting

### Admin Panel Not Showing
- Check URL hash is `#admin`
- Check browser console for errors
- Verify `AdminPage` component is imported in `App.tsx`

### Performance Calculation Fails
- Ensure all funds have valid launch dates
- Check NAV data is available for selected funds
- Verify network connection (calls external API)

### Buckets Not Showing on Home Page
- Check bucket is marked as "Active"
- Verify bucket has at least one fund
- Check browser console for errors

## Future Enhancements

1. **Authentication System**
   - Login page for admins
   - Role-based access control
   - Session management

2. **Backend API**
   - Move bucket storage to database
   - API endpoints for CRUD operations
   - Scheduled performance recalculation

3. **Analytics**
   - Track bucket views
   - Track imports
   - Popular buckets dashboard

4. **Advanced Features**
   - Bulk operations
   - Bucket templates
   - Import/Export buckets as JSON
   - Performance comparison tools

