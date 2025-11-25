# Admin Panel Authentication Setup

## 🔐 Overview

The admin panel is now protected with password-based authentication. Only authorized users with the correct password can access the admin panel to manage suggested buckets.

## 🚀 Quick Setup

### 1. Create Environment File

Create a `.env` file in the `client` directory:

```bash
cd client
touch .env
```

### 2. Set Admin Password

Add your admin password to the `.env` file:

```env
VITE_ADMIN_PASSWORD=your_secure_password_here
```

**Example:**
```env
VITE_ADMIN_PASSWORD=MySecureP@ssw0rd123
```

### 3. Development Default

If you don't set `VITE_ADMIN_PASSWORD` in development mode, the default password is:
```
admin123
```

⚠️ **Important:** Change this default password in production!

## 📝 How It Works

### Authentication Flow

1. **Access Attempt**: User navigates to `#admin` route
2. **Auth Check**: System checks for valid authentication token in localStorage
3. **Login Prompt**: If not authenticated, login dialog appears
4. **Password Verification**: Password is checked against `VITE_ADMIN_PASSWORD` env variable
5. **Token Storage**: If correct, authentication token is stored with 24-hour expiration
6. **Access Granted**: Admin panel is displayed

### Security Features

- ✅ Password-protected access
- ✅ 24-hour session expiration
- ✅ Secure token storage in localStorage
- ✅ Login dialog cannot be dismissed without login
- ✅ Environment variable for password (not hardcoded)
- ✅ Logout functionality

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_ADMIN_PASSWORD` | Admin panel password | No* | `admin123` (dev only) |

*Required in production, optional in development

### Session Duration

By default, authentication tokens expire after **24 hours**. To change this:

Edit `client/src/hooks/useAuth.ts`:
```typescript
const AUTH_DURATION = 24 * 60 * 60 * 1000; // 24 hours
// Change to your desired duration in milliseconds
```

## 🎯 Usage

### For Administrators

1. **Access Admin Panel**
   ```
   Navigate to: http://localhost:5173/#admin
   ```

2. **Login**
   - Enter the admin password
   - Click "Login"
   - Admin panel will be displayed

3. **Logout**
   - Click "Logout" button in admin panel header
   - Session will be cleared
   - Redirected to home page

### Testing

1. **Without Password Set (Development)**
   ```
   Password: admin123
   ```

2. **With Custom Password**
   ```
   Password: [value from VITE_ADMIN_PASSWORD]
   ```

## 🚀 Production Deployment

### Vercel Deployment

1. **Add Environment Variable** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_ADMIN_PASSWORD` = `your_production_password`
   - Select environment: Production, Preview, Development

2. **Redeploy** your application

### Other Platforms

Set the environment variable `VITE_ADMIN_PASSWORD` in your deployment platform's configuration.

## 🔒 Security Best Practices

1. **Strong Password**
   - Use a complex password with:
     - At least 12 characters
     - Mix of uppercase, lowercase, numbers, and symbols
     - Not easily guessable

2. **Environment Variables**
   - Never commit `.env` file to git
   - Keep password secret
   - Use different passwords for dev/staging/production

3. **Regular Updates**
   - Change password periodically
   - Rotate passwords if compromised

4. **Future Enhancements**
   - Consider adding:
     - Multi-factor authentication (2FA)
     - Rate limiting on login attempts
     - Password hashing (currently plain text)
     - Backend authentication API
     - Session management on server

## 🛠️ Troubleshooting

### Issue: Login doesn't work

**Solution:**
- Check if `VITE_ADMIN_PASSWORD` is set correctly
- Restart dev server after changing `.env` file
- Clear browser localStorage and try again

### Issue: Still seeing default password hint

**Solution:**
- This only appears in development mode
- In production, the hint is hidden

### Issue: Session expires too quickly

**Solution:**
- Check `AUTH_DURATION` in `useAuth.ts`
- Verify system clock is correct
- Clear localStorage and login again

### Issue: Can't access admin panel after logout

**Solution:**
- This is expected behavior
- Navigate to `#admin` again to see login dialog
- Enter password to regain access

## 📁 Files Modified

- `client/src/hooks/useAuth.ts` - Authentication hook
- `client/src/components/AdminLogin.tsx` - Login dialog component
- `client/src/components/AdminPage.tsx` - Protected admin page
- `client/.env.example` - Environment variable template

## 🔄 Future Improvements

Possible enhancements:

1. **Backend Authentication**
   - Move password checking to server
   - Use JWT tokens
   - Secure password hashing

2. **Multi-User Support**
   - Multiple admin accounts
   - Role-based permissions
   - User management

3. **Enhanced Security**
   - Password reset functionality
   - Failed login attempt tracking
   - IP whitelisting
   - Two-factor authentication

## ✅ Checklist

- [x] Password-based authentication
- [x] Login dialog component
- [x] Session management (24-hour expiration)
- [x] Logout functionality
- [x] Environment variable configuration
- [x] Protected admin route
- [ ] Backend authentication API (future)
- [ ] Password hashing (future)
- [ ] Rate limiting (future)

---

**Need Help?** Check the error console or contact support.

