# QuizMaster Startup Guide

## 🚀 Quick Start Instructions

### 1. Clean and Prepare Backend
```bash
cd quizserver3/quizserver
mvn clean compile
```

### 2. Start Backend Server (Port 8080)
```bash
mvn spring-boot:run
```
**Wait for**: "Started QuizserverApplication" message

### 3. Start Frontend Server (Port 4200)
```bash
cd quizWeb
ng serve
```

### 4. Access Application
- **Frontend**: http://localhost:4200
- **Backend Health**: http://localhost:8080/api/health

## ✅ Verification Steps

1. **Check Backend**: Visit http://localhost:8080/api/health
   - Should return: `{"status":"UP","message":"Quiz Server is running"}`

2. **Check Frontend**: Visit http://localhost:4200
   - Should load the QuizMaster login page
   - Check browser console for any CORS errors

3. **Test Login**: Try logging in with existing credentials
   - If CORS errors appear, restart both servers

## 🔧 Configuration Fixed

### Application Properties Issues Resolved:
- ✅ **SpringDoc Configuration**: Fixed malformed `springdoc.api-docs.version`
- ✅ **Port Configuration**: Backend on 8080, Frontend on 4200
- ✅ **CORS Origins**: Limited to localhost:4200 only
- ✅ **Database**: Configured for quiz_server_db

### If Backend Fails to Start:
1. **Clean Build**: `mvn clean compile`
2. **Check Database**: Ensure MySQL is running
3. **Verify Credentials**: Update application.properties if needed
4. **Check Port**: Ensure 8080 is available

### If Health Check Shows 403 Error:
1. **Restart Backend**: The SecurityConfig has been updated to allow `/api/health`
2. **Verify Fix**: Visit `http://localhost:8080/api/health` - should return JSON response
3. **Check Console**: No more 403 errors in browser console

## 📋 Port Configuration
- **Backend**: 8080 (Spring Boot)
- **Frontend**: 4200 (Angular)
- **Database**: 3306 (MySQL)

## 🔍 Troubleshooting
- **Configuration Error Fixed**: SpringDoc version property corrected
- **CORS Setup**: Simplified to avoid conflicts
- **Health Check**: Available at /api/health endpoint
- **Clean Build**: Always run `mvn clean compile` after config changes