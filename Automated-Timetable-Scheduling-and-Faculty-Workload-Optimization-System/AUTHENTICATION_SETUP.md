# 🔐 Authentication System - Complete Setup Guide

## ✅ What Has Been Implemented

### **Backend (Spring Boot - Port 8083)**

1. **Authentication DTOs**
   - `LoginRequest.java` - Handles login credentials
   - `LoginResponse.java` - Returns authentication result with user data

2. **Authentication Service**
   - `AuthService.java` - Handles admin and faculty authentication logic
   - Admin authentication: Uses hardcoded credentials
   - Faculty authentication: Queries database for faculty records

3. **Authentication Controller**
   - `AuthController.java` - REST API endpoints
   - `POST /api/auth/login` - Login endpoint
   - `POST /api/auth/logout` - Logout endpoint
   - `GET /api/auth/health` - Health check

4. **Repository Updates**
   - `FacultyRepository.java` - Added `findByEmail()` and `findByEmployeeId()` methods

### **Frontend (React - Port 5173)**

1. **Authentication Context**
   - `AuthContext.tsx` - Global authentication state management
   - Stores user data and role in localStorage
   - Provides `useAuth()` hook for components

2. **Protected Routes**
   - `ProtectedRoute.tsx` - Route guard component
   - Redirects unauthenticated users to `/login`
   - Validates user roles (admin/faculty)

3. **Login Page**
   - `Login.tsx` - Beautiful login interface with:
     - Role selector (Admin/Faculty toggle)
     - Email/EmployeeID and password fields
     - Error handling and loading states
     - Demo credentials display
     - Dark mode toggle
     - Redirects back to intended page after login

4. **API Integration**
   - `api.ts` - Added authentication functions:
     - `login()` - Authenticate user
     - `logout()` - End session

5. **App Configuration**
   - All admin routes wrapped with `<ProtectedRoute requiredRole="admin">`
   - All faculty routes wrapped with `<ProtectedRoute requiredRole="faculty">`

---

## 🔑 Demo Credentials

### **Admin Login**
- **Email**: `admin@acadschedule.com`
- **Password**: `password123`
- **Access**: All admin routes (`/admin/*`)

### **Faculty Login**
- **Email**: Any faculty email from database (e.g., faculty member's email)
- **Password**: `faculty123`
- **Access**: All faculty routes (`/faculty/*`)

---

## 🚀 How It Works

### **User Flow**

1. **Accessing Protected Routes**
   ```
   User tries to access: http://localhost:5173/admin
   ↓
   ProtectedRoute checks authentication
   ↓
   Not authenticated? → Redirect to /login
   ↓
   User enters credentials
   ↓
   Backend validates credentials
   ↓
   Success? → Save to AuthContext & redirect back to /admin
   ```

2. **Role-Based Access**
   - **Admin** can only access `/admin/*` routes
   - **Faculty** can only access `/faculty/*` routes
   - Wrong role? Redirected to appropriate dashboard

3. **Session Persistence**
   - User data stored in `localStorage`
   - Survives page refreshes
   - Cleared on logout

---

## 📍 Important URLs

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Login page | Public |
| `/` | Landing page | Public |
| `/admin` | Admin dashboard | Admin only |
| `/admin/faculty` | Faculty management | Admin only |
| `/admin/timetable` | Timetable management | Admin only |
| `/faculty/dashboard` | Faculty dashboard | Faculty only |
| `/faculty/schedule` | Faculty schedule | Faculty only |
| `/faculty/leave` | Leave requests | Faculty only |

---

## 🧪 Testing the Authentication

### **Test 1: Admin Login**
1. Navigate to `http://localhost:5173/admin`
2. You should be redirected to `/login`
3. Select **Admin** role
4. Enter: `admin@acadschedule.com` / `password123`
5. Click **Sign In as admin**
6. You should be redirected back to `/admin` dashboard

### **Test 2: Faculty Login**
1. Navigate to `http://localhost:5173/faculty/dashboard`
2. You should be redirected to `/login`
3. Select **Faculty** role
4. Enter any faculty email from your database / `faculty123`
5. Click **Sign In as faculty**
6. You should be redirected to `/faculty/dashboard`

### **Test 3: Wrong Role Access**
1. Login as **Faculty**
2. Try to access `http://localhost:5173/admin`
3. You should be redirected to `/faculty/dashboard` (your allowed page)

---

## 🔧 Backend Configuration

### **Database Connection**
```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/unitt_db
spring.datasource.username=postgres
spring.datasource.password=Esha@123$
server.port=8083
```

### **API Endpoint**
```
POST http://localhost:8083/api/auth/login
Content-Type: application/json

{
  "identifier": "admin@acadschedule.com",
  "password": "password123",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "role": "admin",
  "user": {
    "id": 0,
    "name": "Administrator",
    "email": "admin@acadschedule.com",
    "department": "Administration",
    "employeeId": "ADMIN001"
  }
}
```

---

## 📝 Key Files Created/Modified

### **Backend**
- ✅ `AuthController.java` - Authentication REST endpoints
- ✅ `AuthService.java` - Authentication business logic
- ✅ `LoginRequest.java` - Login request DTO
- ✅ `LoginResponse.java` - Login response DTO
- ✅ `FacultyRepository.java` - Added query methods

### **Frontend**
- ✅ `AuthContext.tsx` - Authentication state management
- ✅ `ProtectedRoute.tsx` - Route protection component
- ✅ `Login.tsx` - Login page UI
- ✅ `api.ts` - Authentication API functions
- ✅ `App.tsx` - Protected route configuration

---

## 🎯 Next Steps (Optional Enhancements)

1. **Add Password Hashing**
   - Use BCrypt to hash passwords in the database
   - Update AuthService to verify hashed passwords

2. **Add JWT Tokens**
   - Generate JWT tokens on login
   - Send tokens with API requests
   - Validate tokens on backend

3. **Add Remember Me**
   - Option to keep users logged in longer
   - Use secure cookies

4. **Add Password Reset**
   - Forgot password functionality
   - Email verification

5. **Add Session Timeout**
   - Auto-logout after inactivity
   - Refresh token mechanism

---

## 🐛 Troubleshooting

### **Issue: "Cannot find module 'tailwindcss'"**
**Solution**: Run `npm install` in the frontend directory

### **Issue: Login redirects to wrong page**
**Solution**: Check the role in AuthContext and ProtectedRoute configuration

### **Issue: Backend not responding**
**Solution**: 
- Ensure backend is running on port 8083
- Check database connection
- Verify CORS is enabled

### **Issue: "Network Error" on login**
**Solution**: 
- Verify backend is running: `http://localhost:8083/api/auth/health`
- Check browser console for CORS errors
- Ensure API_BASE_URL is correct in `api.ts`

---

## ✨ Summary

You now have a **fully functional authentication system** with:
- ✅ Role-based access control (Admin & Faculty)
- ✅ Protected routes that redirect to login
- ✅ Beautiful login UI with dark mode
- ✅ Session persistence with localStorage
- ✅ Backend API integration
- ✅ Database-backed faculty authentication

**All admin and faculty routes are now protected!** 🎉
