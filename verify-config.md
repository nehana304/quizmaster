# Configuration Verification Checklist

## ✅ Backend Configuration Check

### 1. Application Properties
- ✅ **Server Port**: 8080
- ✅ **Database**: MySQL on localhost:3306
- ✅ **CORS Origins**: localhost:4200, 127.0.0.1:4200
- ✅ **SpringDoc**: OPENAPI_3_0

### 2. Database Setup
```sql
-- Ensure MySQL is running and database exists
CREATE DATABASE IF NOT EXISTS quiz_server_db;
```

### 3. Start Backend
```bash
cd quizserver3/quizserver
mvn clean compile
mvn spring-boot:run
```

**Expected Output:**
```
Started QuizserverApplication in X.XXX seconds (JVM running for X.XXX)
```

### 4. Verify Backend Health
Visit: http://localhost:8080/api/health

**Expected Response:**
```json
{
  "status": "UP",
  "message": "Quiz Server is running",
  "timestamp": 1698765432000,
  "port": "8080"
}
```

## ✅ Frontend Configuration Check

### 1. Start Frontend
```bash
cd quizWeb
npm install  # if first time
ng serve
```

### 2. Verify Frontend
Visit: http://localhost:4200

**Expected:**
- ✅ Login page loads without errors
- ✅ No CORS errors in browser console
- ✅ Server connectivity check passes

## 🔧 Troubleshooting

### Backend Won't Start
1. **Check MySQL**: Ensure MySQL is running on port 3306
2. **Check Database**: Verify `quiz_server_db` database exists
3. **Check Credentials**: Update username/password in application.properties
4. **Check Port**: Ensure port 8080 is not in use

### CORS Errors
1. **Verify Ports**: Backend on 8080, Frontend on 4200
2. **Check Origins**: Only localhost:4200 should be allowed
3. **Restart Both**: Stop and restart both servers

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u root -p -h localhost -P 3306
USE quiz_server_db;
SHOW TABLES;
```

## 📝 Configuration Summary

| Component | Port | URL |
|-----------|------|-----|
| Backend | 8080 | http://localhost:8080 |
| Frontend | 4200 | http://localhost:4200 |
| Database | 3306 | localhost:3306/quiz_server_db |
| Health Check | 8080 | http://localhost:8080/api/health |