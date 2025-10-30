# QuizMaster - Interactive Quiz Platform

A full-stack quiz application with Angular frontend and Spring Boot backend, featuring real-time quizzes, leaderboards, sound effects, and smooth animations.

## 🚀 Features

### For Students
- **Join quizzes** using test codes
- **Real-time timer** with audio warnings
- **Interactive UI** with sound effects and animations
- **View test results** and performance history
- **Responsive design** for all devices

### For Admins
- **Create and manage tests** with custom questions
- **Generate unique test codes** for easy sharing
- **View leaderboards** with rankings and statistics
- **Export results** to CSV format
- **Activate/deactivate tests** as needed

### Technical Features
- **JWT Authentication** with role-based access
- **Sound effects** for enhanced user experience
- **Smooth animations** throughout the application
- **Real-time progress tracking**
- **Secure API** with CORS configuration
- **Modern UI** with Ant Design components

## 🛠️ Tech Stack

### Frontend
- **Angular 18** with standalone components
- **Ng-Zorro (Ant Design)** for UI components
- **TypeScript** for type safety
- **CSS3** with custom animations
- **Web Audio API** for sound effects

### Backend
- **Spring Boot 3** with Java
- **Spring Security** with JWT authentication
- **JPA/Hibernate** for database operations
- **MySQL** database
- **Maven** for dependency management

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Java 17** or higher
- **Maven 3.6+**
- **MySQL 8.0+**

## 🚀 Quick Start

### 1. Database Setup
```sql
CREATE DATABASE quiz_server_db;
CREATE USER 'quiz_user'@'localhost' IDENTIFIED BY 'quiz_password';
GRANT ALL PRIVILEGES ON quiz_server_db.* TO 'quiz_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup
```bash
cd quizserver3/quizserver
mvn clean install
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

### 3. Frontend Setup
```bash
cd quizWeb
npm install
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8081
- **Default Admin**: Create via registration with ADMIN role

## 📁 Project Structure

```
Quiz_project/
├── quizWeb/                    # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/
│   │   │   │   ├── admin/      # Admin components
│   │   │   │   ├── auth/       # Authentication
│   │   │   │   ├── user/       # User components
│   │   │   │   └── shared/     # Shared services
│   │   │   └── styles.css      # Global styles
│   │   └── ...
│   ├── package.json
│   └── angular.json
│
└── quizserver3/               # Spring Boot Backend
    └── quizserver/
        ├── src/main/java/com/quizserver/
        │   ├── controller/    # REST Controllers
        │   ├── service/       # Business Logic
        │   ├── entities/      # JPA Entities
        │   ├── dto/          # Data Transfer Objects
        │   ├── repository/    # Data Access Layer
        │   └── config/       # Configuration
        ├── pom.xml
        └── application.properties
```

## 🎮 How to Use

### For Students
1. **Register** as a user or login
2. **Enter test code** provided by instructor
3. **Take the quiz** with real-time timer
4. **View results** and performance metrics

### For Admins
1. **Register** as admin or login
2. **Create tests** with custom questions
3. **Share test codes** with students
4. **Monitor progress** via leaderboards
5. **Export results** for analysis

## 🔧 Configuration

### Database Configuration
Update `quizserver3/quizserver/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/quiz_server_db
spring.datasource.username=quiz_user
spring.datasource.password=quiz_password
```

### Frontend Configuration
Update API URLs in service files if needed:
```typescript
const BASIC_URL = 'http://localhost:8081/';
```

## 🎨 Features Showcase

### Sound Effects
- ✅ Answer selection sounds
- ✅ Timer warning alerts
- ✅ Success/error feedback
- ✅ Mute/unmute toggle

### Animations
- ✅ Page entrance animations
- ✅ Card hover effects
- ✅ Button interactions
- ✅ Loading states
- ✅ Staggered element reveals

### Responsive Design
- ✅ Mobile-friendly interface
- ✅ Tablet optimization
- ✅ Desktop experience
- ✅ Accessibility support

## 🐛 Troubleshooting

### Common Issues

**Frontend won't start:**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

**Backend connection issues:**
- Check MySQL is running
- Verify database credentials
- Ensure port 8081 is available

**CORS errors:**
- Verify frontend URL in CORS configuration
- Check if both servers are running

### Port Configuration
- **Frontend**: Default 4200, can run on 4201
- **Backend**: Default 8081
- **Database**: Default 3306

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Tests
- `GET /api/test` - Get all active tests
- `POST /api/test` - Create new test
- `GET /api/test/code/{code}` - Get test by code
- `POST /api/test/submit-test` - Submit test answers

### Results
- `GET /api/test/test-result` - Get all results
- `GET /api/test/test-result/{userId}` - Get user results

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Angular Team** for the amazing framework
- **Ant Design** for beautiful UI components
- **Spring Boot** for robust backend framework
- **Wayground** for inspiration on quiz platform design

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Ensure database is properly configured
4. Check console logs for detailed error messages

---

**Happy Quizzing! 🎉**
## 🔧
 Troubleshooting

### CORS Errors
If you encounter CORS errors like "Cross-Origin Request Blocked":

1. **Check Backend Server**: Ensure the Spring Boot server is running on port **8080**
2. **Check Frontend Server**: Ensure Angular is running on port **4200**
3. **Verify Configuration**: 
   - Backend should be accessible at `http://localhost:8080`
   - Frontend should be accessible at `http://localhost:4200`

### Server Connection Issues

**Error**: "Unable to connect to the server"
**Solution**: 
1. Start the backend server first: `mvn spring-boot:run` (in quizserver3/quizserver directory)
2. Wait for the server to fully start (you should see "Started QuizserverApplication")
3. Then start the frontend: `ng serve` (in quizWeb directory)

### Port Configuration
- **Backend**: Port 8080 (configured in `application.properties`)
- **Frontend**: Port 4200 (default Angular dev server)
- **Database**: Port 3306 (MySQL default)

### Health Check
Visit `http://localhost:8080/api/health` in your browser to verify the backend is running.

### Common Issues
1. **Database Connection**: Ensure MySQL is running and credentials in `application.properties` are correct
2. **Port Conflicts**: Make sure ports 8080 and 4200 are not used by other applications
3. **CORS Configuration**: All CORS settings are configured for localhost:4200 only
