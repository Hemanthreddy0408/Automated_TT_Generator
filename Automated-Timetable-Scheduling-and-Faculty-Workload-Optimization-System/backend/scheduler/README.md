# Backend - Academic Scheduler (Spring Boot)

> RESTful backend service for academic timetable generation and faculty workload optimization. Built with Spring Boot, PostgreSQL, and JPA.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The backend service provides a comprehensive REST API for managing academic scheduling operations, including:

- **Faculty Management**: CRUD operations for teaching staff
- **Resource Management**: Manage rooms, subjects, and sections
- **Schedule Generation**: Intelligent algorithm-based timetable creation
- **Constraint Management**: Define and enforces scheduling rules
- **Leave Management**: Faculty leave requests and approval workflow
- **Analytics**: Schedule quality metrics and optimization insights
- **Announcements**: Institutional communication system

---

## 💻 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 17+ | Programming language |
| **Spring Boot** | 3.2.5 | Framework |
| **Spring Data JPA** | Latest | Database ORM |
| **Hibernate** | 6.x | JPA Implementation |
| **Spring Security** | Latest | Authentication & Authorization |
| **PostgreSQL** | 12+ | Database |
| **Maven** | 3.6+ | Build tool |
| **Jakarta Persistence** | 3.1.0 | JPA standard |

---

## 🏗️ Architecture

### Layered Architecture

```
Frontend (React)
    ↓
REST API (Controllers)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (PostgreSQL)
```

### Component Breakdown

#### Controllers (`controller/`)
- Handle HTTP requests and responses
- Request validation and routing
- HTTP status code management

#### Services (`service/`)
- Core business logic
- Optimization algorithms
- Constraint validation
- Workload calculation

#### Repositories (`repository/`)
- Spring Data JPA interfaces
- Database query operations
- Custom query methods

#### Entities (`entity/`)
- JPA domain models
- Database table mappings
- Relationships and constraints

#### DTOs (`dto/`)
- Data transfer objects
- Request/response bodies
- Input validation rules

#### Configuration (`config/`)
- Spring configuration classes
- Security settings
- CORS configuration
- Bean definitions

#### Aspects (`aspect/`)
- Cross-cutting concerns
- Logging and auditing
- Performance monitoring

---

## 📦 Prerequisites

### System Requirements
- **Java**: JDK 17 or higher
- **Maven**: 3.6.0 or higher
- **PostgreSQL**: 12 or higher
- **Git**: For version control

### Environment Setup
```bash
# Verify Java installation
java -version

# Verify Maven installation
mvn -version

# Verify PostgreSQL
psql --version
```

---

## 🚀 Installation & Setup

### 1. **Clone Repository**
```bash
git clone <repository-url>
cd backend/scheduler
```

### 2. **Create PostgreSQL Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE scheduler_db;

# Create user (if needed)
CREATE USER scheduler_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE scheduler_db TO scheduler_user;

# Exit
\q
```

### 3. **Configure Application Properties**
Create or update `src/main/resources/application.properties`:

```properties
# ==================== DATABASE ====================
spring.datasource.url=jdbc:postgresql://localhost:5432/scheduler_db
spring.datasource.username=scheduler_user
spring.datasource.password=your_secure_password
spring.datasource.driver-class-name=org.postgresql.Driver

# ==================== JPA/HIBERNATE ====================
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# ==================== SERVER ====================
server.port=8083
server.shutdown=graceful
server.servlet.context-path=/

# ==================== LOGGING ====================
logging.level.root=INFO
logging.level.com.acadschedule=DEBUG

# ==================== JACKSON ====================
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.default-property-inclusion=non_null

# ==================== SECURITY ====================
# Configure security settings as needed
```

### 4. **Build the Project**
```bash
# Using Maven Wrapper (recommended)
./mvnw clean install

# Or using system Maven
mvn clean install
```

### 5. **Run the Application**
```bash
# Using Maven
./mvnw spring-boot:run

# Or directly
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8083"
```

**Application URL**: `http://localhost:8083`

---

## 📂 Project Structure

```
backend/scheduler/
│
├── pom.xml                          # Maven configuration & dependencies
├── mvnw / mvnw.cmd                  # Maven wrapper
│
└── src/
    ├── main/
    │   ├── java/com/acadschedule/scheduler/
    │   │   ├── aspect/
    │   │   │   ├── LoggingAspect.java           # Cross-cutting logging
    │   │   │   └── /* other aspects */
    │   │   │
    │   │   ├── config/
    │   │   │   ├── SecurityConfig.java          # Spring Security configuration
    │   │   │   ├── CorsConfig.java              # CORS settings
    │   │   │   └── /* other configs */
    │   │   │
    │   │   ├── controller/
    │   │   │   ├── FacultyController.java       # Faculty REST endpoints
    │   │   │   ├── ScheduleController.java      # Schedule endpoints
    │   │   │   ├── LeaveController.java         # Leave management
    │   │   │   ├── ConstraintController.java    # Constraint endpoints
    │   │   │   ├── RoomController.java          # Room management
    │   │   │   ├── SubjectController.java       # Subject management
    │   │   │   ├── SectionController.java       # Section management
    │   │   │   └── AnnouncementController.java  # Announcements
    │   │   │
    │   │   ├── dto/
    │   │   │   ├── FacultyDTO.java
    │   │   │   ├── ScheduleDTO.java
    │   │   │   ├── LeaveDTO.java
    │   │   │   ├── ConstraintDTO.java
    │   │   │   └── /* other DTOs */
    │   │   │
    │   │   ├── entity/
    │   │   │   ├── Faculty.java                 # Faculty entity
    │   │   │   ├── Schedule.java                # Schedule entity
    │   │   │   ├── Leave.java                   # Leave entity
    │   │   │   ├── Constraint.java              # Constraint entity
    │   │   │   ├── Room.java                    # Room entity
    │   │   │   ├── Subject.java                 # Subject entity
    │   │   │   ├── Section.java                 # Section entity
    │   │   │   ├── Announcement.java            # Announcement entity
    │   │   │   ├── Slot.java                    # Time slot entity
    │   │   │   └── /* other entities */
    │   │   │
    │   │   ├── repository/
    │   │   │   ├── FacultyRepository.java
    │   │   │   ├── ScheduleRepository.java
    │   │   │   ├── LeaveRepository.java
    │   │   │   ├── ConstraintRepository.java
    │   │   │   ├── RoomRepository.java
    │   │   │   ├── SubjectRepository.java
    │   │   │   ├── SectionRepository.java
    │   │   │   └── /* other repositories */
    │   │   │
    │   │   ├── service/
    │   │   │   ├── FacultyService.java          # Faculty business logic
    │   │   │   ├── ScheduleService.java         # Schedule generation & management
    │   │   │   ├── LeaveService.java            # Leave request handling
    │   │   │   ├── ConstraintService.java       # Constraint management
    │   │   │   ├── RoomService.java             # Room management
    │   │   │   ├── SubjectService.java          # Subject management
    │   │   │   ├── SectionService.java          # Section management
    │   │   │   ├── OptimizationService.java     # Scheduling algorithms
    │   │   │   └── /* other services */
    │   │   │
    │   │   └── SchedulerApplication.java        # Application entry point
    │   │
    │   └── resources/
    │       ├── application.properties           # Application configuration
    │       ├── data.sql                         # Initial data (optional)
    │       └── logback.xml                      # Logging configuration
    │
    └── test/
        └── java/com/acadschedule/scheduler/
            ├── controller/
            ├── service/
            └── repository/
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8083/api
```

### Faculty Management

#### Get All Faculty
```http
GET /api/faculty
```
**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Dr. John Doe",
    "email": "john@example.com",
    "specialization": "Computer Science",
    "maxHoursPerWeek": 16,
    "currentLoad": 12
  }
]
```

#### Create Faculty
```http
POST /api/faculty
Content-Type: application/json
```
**Request Body**:
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane@example.com",
  "specialization": "Mathematics",
  "maxHoursPerWeek": 18
}
```

#### Get Faculty by ID
```http
GET /api/faculty/{id}
```

#### Update Faculty
```http
PUT /api/faculty/{id}
Content-Type: application/json
```

#### Delete Faculty
```http
DELETE /api/faculty/{id}
```

---

### Schedule Management

#### Generate Schedule
```http
POST /api/schedule/generate
```
Triggers the optimization algorithm to generate an optimized timetable.

**Response**: `202 Accepted` (Async operation)

#### Get Current Schedule
```http
GET /api/schedule
```
**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "faculty": { "id": 1, "name": "Dr. John Doe" },
    "subject": { "id": 1, "name": "Data Structures" },
    "section": { "id": 1, "name": "CS-A" },
    "room": { "id": 1, "name": "Room 101" },
    "dayOfWeek": "MONDAY",
    "startTime": "09:00",
    "endTime": "10:30",
    "isOptimized": true
  }
]
```

#### Update Schedule Entry
```http
PUT /api/schedule/{id}
Content-Type: application/json
```

---

### Leave Management

#### Get Leave Requests
```http
GET /api/leaves
```
**Query Parameters**:
- `status`: PENDING, APPROVED, REJECTED
- `facultyId`: Filter by faculty

#### Submit Leave Request
```http
POST /api/leaves
Content-Type: application/json
```
**Request Body**:
```json
{
  "facultyId": 1,
  "startDate": "2024-03-01",
  "endDate": "2024-03-05",
  "reason": "Medical appointment"
}
```

#### Update Leave Status
```http
PATCH /api/leaves/{id}/status?status=APPROVED
```

---

### Constraint Management

#### Get All Constraints
```http
GET /api/constraints
```

#### Create Constraint
```http
POST /api/constraints
Content-Type: application/json
```
**Request Body**:
```json
{
  "name": "No back-to-back classes",
  "description": "Faculty should have at least 30 min break between classes",
  "priority": "MANDATORY",
  "isActive": true,
  "weight": 100
}
```

#### Update Constraint
```http
PUT /api/constraints/{id}
```

#### Delete Constraint
```http
DELETE /api/constraints/{id}
```

---

### Resource Management

#### Rooms
```http
GET /api/rooms
POST /api/rooms
GET /api/rooms/{id}
PUT /api/rooms/{id}
DELETE /api/rooms/{id}
```

#### Subjects
```http
GET /api/subjects
POST /api/subjects
GET /api/subjects/{id}
PUT /api/subjects/{id}
DELETE /api/subjects/{id}
```

#### Sections
```http
GET /api/sections
POST /api/sections
GET /api/sections/{id}
PUT /api/sections/{id}
DELETE /api/sections/{id}
```

---

### Announcements

#### Get Announcements
```http
GET /api/announcements
```

#### Create Announcement
```http
POST /api/announcements
Content-Type: application/json
```
**Request Body**:
```json
{
  "title": "Spring Semester Schedule",
  "content": "The spring semester schedule has been published.",
  "author": "Administrator"
}
```

---

## 📊 Database Schema

### Faculty Table
```sql
CREATE TABLE faculty (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  specialization VARCHAR(255),
  max_hours_per_week INT DEFAULT 18,
  current_load INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Schedule Table
```sql
CREATE TABLE schedule (
  id BIGSERIAL PRIMARY KEY,
  faculty_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  section_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  slot_id BIGINT NOT NULL,
  day_of_week VARCHAR(20),
  start_time TIME,
  end_time TIME,
  is_optimized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);
```

### Leave Table
```sql
CREATE TABLE leave (
  id BIGSERIAL PRIMARY KEY,
  faculty_id BIGINT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);
```

### Constraint Table
```sql
CREATE TABLE constraint (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  weight INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Configuration

### Application Properties

#### Database Configuration
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/scheduler_db
spring.datasource.username=scheduler_user
spring.datasource.password=your_password
```

#### JPA/Hibernate Configuration
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
```

#### Server Configuration
```properties
server.port=8083
server.servlet.context-path=/
server.shutdown=graceful
```

#### CORS Configuration
```properties
# Handled in CorsConfig.java
# Allows requests from frontend applications
```

### Security Configuration

Configure in `config/SecurityConfig.java`:
- Authentication mechanisms
- Authorization rules
- CORS headers
- CSRF protection

---

## ▶️ Running the Application

### Development Environment

#### Using Maven Wrapper
```bash
# Build and run
./mvnw clean install
./mvnw spring-boot:run
```

#### Using Maven (System Installation)
```bash
mvn clean install
mvn spring-boot:run
```

#### With Custom Port
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8083"
```

#### IDE (IntelliJ IDEA / Eclipse)
1. Open project in IDE
2. Right-click `SchedulerApplication.java`
3. Select "Run" or "Debug"

### Application Startup
```
Starting SchedulerApplication v0.0.1-SNAPSHOT...
Application 'scheduler' is running...
Tomcat initialized with port(s): 8083 (http)
Server started on port 8083
```

### Verify Application
```bash
curl http://localhost:8083/api/faculty
```

---

## 🔧 Development Guide

### Adding a New Entity

1. **Create entity class** in `entity/`:
```java
@Entity
@Table(name = "my_entity")
public class MyEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  private String name;
  
  // getters, setters, constructors
}
```

2. **Create repository** in `repository/`:
```java
@Repository
public interface MyEntityRepository extends JpaRepository<MyEntity, Long> {
}
```

3. **Create service** in `service/`:
```java
@Service
public class MyEntityService {
  @Autowired
  private MyEntityRepository repository;
  
  public MyEntity create(MyEntity entity) {
    return repository.save(entity);
  }
}
```

4. **Create controller** in `controller/`:
```java
@RestController
@RequestMapping("/api/my-entity")
public class MyEntityController {
  @Autowired
  private MyEntityService service;
  
  @PostMapping
  public MyEntity create(@RequestBody MyEntity entity) {
    return service.create(entity);
  }
}
```

### Database Migrations

New tables are automatically created via Hibernate DDL:
```properties
spring.jpa.hibernate.ddl-auto=update
```

For manual migrations, use SQL scripts in `resources/`.

---

## 🧪 Testing

### Unit Tests
```bash
./mvnw test
```

### Test Structure
```
src/test/java/com/acadschedule/scheduler/
├── controller/      # Controller tests
├── service/         # Service logic tests
└── repository/      # Repository tests
```

### Running Specific Tests
```bash
./mvnw test -Dtest=FacultyServiceTest
./mvnw test -Dtest=ScheduleControllerTest
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Database Connection Error**
```
Error: FATAL: database "scheduler_db" does not exist
```
**Solution**: Create the database
```bash
createdb scheduler_db
```

#### 2. **Port Already in Use**
```
Error: Port 8083 is already in use
```
**Solution**: Change port or stop existing service
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8084"
```

#### 3. **Java Version Mismatch**
```
Error: Unsupported class version
```
**Solution**: Install Java 17+
```bash
java -version  # Check current version
```

#### 4. **Maven Build Failure**
**Solution**: Clean and rebuild
```bash
./mvnw clean install -DskipTests
```

#### 5. **PostgreSQL Connection Timeout**
**Solution**: Verify PostgreSQL is running
```bash
psql -U postgres -d scheduler_db
```

---

## 📝 Best Practices

### Code Quality
- Follow Spring Boot conventions
- Use meaningful variable names
- Add JavaDoc comments for public methods
- Implement proper exception handling

### Database
- Use transactions for multi-step operations
- Index frequently queried columns
- Use proper relationship mappings
- Implement cascade policies carefully

### API Design
- Use appropriate HTTP methods
- Return proper status codes
- Provide meaningful error messages
- Version APIs as needed

### Security
- Never commit credentials
- Validate all inputs
- Use parameterized queries
- Implement rate limiting

---

## 📖 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA Guide](https://spring.io/projects/spring-data-jpa)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit pull request

---

**Version**: 0.0.1-SNAPSHOT  
**Last Updated**: February 2026
