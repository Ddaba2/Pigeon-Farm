# 🔧 Troubleshooting Guide: 500 Internal Server Error

## Problem
You're getting a 500 Internal Server Error when trying to log in to the Pigeon Farm application.

## Root Cause Analysis
The 500 error is most likely caused by a **database connection issue** or **missing database tables**.

## Step-by-Step Solution

### 1. Check MySQL Status
First, verify that MySQL is running:

**Windows:**
```powershell
# Check if MySQL service is running
Get-Service -Name "*mysql*"

# Start MySQL if not running
Start-Service -Name "MySQL80"  # or your MySQL service name
```

**Linux/Mac:**
```bash
# Check MySQL status
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql
```

### 2. Test Database Connection
Run the database connection test:

```bash
cd backend
node check-mysql.js
```

This will tell you:
- ✅ If MySQL is accessible
- ✅ If the database exists
- ✅ If the required tables exist

### 3. Setup Database (if needed)
If the database doesn't exist or tables are missing:

```bash
cd backend
node setup-database.js
```

This will:
- Create the `pigeon_manager` database
- Create all required tables
- Set up proper indexes and relationships

### 4. Create Test User
Create a test user for authentication:

```bash
cd backend
node create-test-user.js
```

This creates a test user with credentials:
- **Username:** `testuser`
- **Email:** `test@example.com`
- **Password:** `testpass123`

### 5. Restart Backend Server
Restart the backend server to ensure all changes are loaded:

```bash
# Stop the current server (Ctrl+C)
# Then restart
cd backend
npm start
```

### 6. Test Login
Try logging in with the test credentials:
- Username: `testuser`
- Password: `testpass123`

## Common Issues & Solutions

### Issue 1: MySQL Not Running
**Symptoms:** Connection refused errors
**Solution:** Start MySQL service

### Issue 2: Wrong Database Credentials
**Symptoms:** Access denied errors
**Solution:** Check `backend/config.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=pigeon_manager
DB_PORT=3306
```

### Issue 3: Database Doesn't Exist
**Symptoms:** "Database not found" errors
**Solution:** Run `node setup-database.js`

### Issue 4: Tables Missing
**Symptoms:** "Table doesn't exist" errors
**Solution:** Run `node setup-database.js`

### Issue 5: Port Already in Use
**Symptoms:** "Port 3002 already in use"
**Solution:** 
```bash
# Find process using port 3002
netstat -ano | findstr :3002

# Kill the process
taskkill /PID <process_id> /F
```

## Verification Steps

After completing the setup, verify everything works:

1. **Check server health:**
   ```
   http://localhost:3002/api/health
   ```

2. **Test database connection:**
   ```bash
   node check-mysql.js
   ```

3. **Try login with test user:**
   - Username: `testuser`
   - Password: `testpass123`

## Still Having Issues?

If you're still getting 500 errors after following these steps:

1. **Check server logs** for specific error messages
2. **Verify MySQL is running** and accessible
3. **Ensure database credentials** are correct
4. **Check if all required tables** exist in the database

## Quick Fix Script

Run this command to automatically fix common issues:

```bash
cd backend
node check-mysql.js && node setup-database.js && node create-test-user.js
```

This will:
- Check MySQL connection
- Setup database if needed
- Create test user
- Provide detailed feedback

## Support

If you continue to have issues, please provide:
1. The output of `node check-mysql.js`
2. Any error messages from the server logs
3. Your MySQL version and configuration
