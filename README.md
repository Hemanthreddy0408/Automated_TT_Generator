# Automated Timetable Scheduling and Faculty Workload Optimization System


## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Component Documentation](#component-documentation)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Configuration](#configuration)
- [Contributing](#contributing)

---

## 🎯 Overview

Manual academic timetable creation is time-consuming, error-prone, and often results in:
- Scheduling conflicts
- Unfair faculty workload distribution
- Overbooked rooms and resources
- Inefficient resource utilization

This system provides an **intelligent, centralized platform** that:
- ✅ Automatically generates conflict-free timetables
- ✅ Balances faculty workloads fairly and transparently
- ✅ Manages resources (faculty, rooms, subjects, sections)
- ✅ Allows administrators to define and enforce scheduling constraints
- ✅ Provides real-time analytics and optimization insights
- ✅ Enables faculty to submit leave requests
- ✅ Generates exportable schedules (PDF, Excel, ICS)

---

## 🚀 Key Features

### For Administrators
- **Dashboard & Analytics**: Real-time insights on schedule quality, workload balance, and resource utilization
- **Constraint Management**: Define and manage mandatory, preferred, and optional scheduling constraints with priority levels
- **Faculty Management**: Add, update, and manage faculty profiles with specializations
- **Resource Management**: Manage rooms, subjects, and sections
- **Leave Management**: Review and approve faculty leave requests
- **Schedule Generation**: Trigger intelligent schedule optimization algorithms
- **Announcements**: Broadcast important institutional information

### For Faculty
- **Personal Dashboard**: View workload distribution and schedule insights
- **Schedule Management**: View assigned courses and time slots
- **Leave Applications**: Submit and track leave requests
- **Schedule Export**: Download schedules in multiple formats (PDF, Excel, ICS)
- **Announcements Feed**: Stay updated with institutional announcements

### Core Capabilities
- **Constraint-Aware Scheduling**: Multi-level constraint management (Mandatory, Preferred, Optional)
- **Workload Optimization**: Advanced algorithms for fair faculty load distribution
- **Conflict Detection**: Automatic identification and prevention of scheduling conflicts
- **Real-time Synchronization**: Live updates across all connected clients
- **Audit Trail**: Maintain history of all scheduling decisions and changes

---

## 🏗️ Project Architecture

```
Automated Timetable Scheduling System
│
├── Backend (Spring Boot REST API)
│   ├── Controllers: Handle HTTP requests
│   ├── Services: Business logic & algorithms
│   ├── Repositories: Data access layer
│   ├── Entities: Domain models
│   ├── DTOs: Data transfer objects
│   └── Configuration: Security, CORS, etc.
│
├── Frontend Admin (React + Vite)
│   ├── Dashboard & Analytics
│   ├── Resource Management
│   ├── Constraint Management
│   ├── Schedule Management
│   └── Leave Request Management
│
└── Frontend Faculty (React + Vite)
    ├── Personal Dashboard
    ├── Schedule Viewing
    ├── Leave Application
    └── Schedule Export
```

---

## 💻 Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA (Hibernate)
- **Security**: Spring Security
- **Build Tool**: Maven
- **APIs**: REST (JSON)

### Frontend (Admin & Faculty)
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.17
- **UI Component Library**: Shadcn/ui (Radix UI)
- **HTTP Client**: Axios 1.13.4
- **State Management**: React Context API
- **Form Handling**: React Hook Form 7.61.1
- **Validation**: Zod 3.25.76
- **Routing**: React Router DOM 6.30.1
- **Charts**: Recharts 2.15.4
- **Testing**: Vitest 3.2.4

### Database
- **Primary**: PostgreSQL (main data store)
- **ORM Mapping**: Hibernate 6

---

## 📦 Prerequisites

### System Requirements
- **Node.js**: v18+ (for frontend)
- **Java**: JDK 17+ (for backend)
- **PostgreSQL**: 12+
- **Maven**: 3.6+
- **Bun** (optional, for package management)

### Environment Setup
1. PostgreSQL database configured and running
2. Environment variables properly set
3. Network connectivity for API communication

---

## 🚀 Quick Start

### 1. **Clone Repository**
```bash
git clone <repository-url>
cd Automated-Timetable-Scheduling-and-Faculty-Workload-Optimization-System
```

### 2. **Backend Setup**
```bash
cd backend/scheduler

# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```
Backend will run on: `http://localhost:8083`

### 3. **Frontend Admin Setup**
```bash
cd frontend-admin

# Install dependencies
bun install          # or npm install

# Run development server
bun dev              # or npm run dev
```
Admin Portal: `http://localhost:8080`

### 4. **Frontend Faculty Setup**
```bash
cd frontend-faculty

# Install dependencies
bun install          # or npm install

# Run development server
bun dev              # or npm run dev
```
Faculty Portal: `http://localhost:8081` (or configured port)

---

## 📂 Project Structure

```
Automated-Timetable-Scheduling-and-Faculty-Workload-Optimization-System/
│
├── backend/
│   └── scheduler/
│       ├── pom.xml                 # Maven configuration
│       ├── mvnw / mvnw.cmd         # Maven wrapper
│       └── src/
│           ├── main/
│           │   ├── java/com/acadschedule/scheduler/
│           │   │   ├── aspect/            # AOP aspects
│           │   │   ├── config/            # Spring configuration
│           │   │   ├── controller/        # REST controllers
│           │   │   ├── dto/               # Data transfer objects
│           │   │   ├── entity/            # JPA entities
│           │   │   ├── repository/        # Data repositories
│           │   │   ├── service/           # Business logic
│           │   │   └── SchedulerApplication.java
│           │   └── resources/
│           │       ├── application.properties
│           │       └── data.sql
│           └── test/
│
├── frontend-admin/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── components/
│       │   ├── layout/          # Layout components
│       │   ├── dashboard/       # Dashboard pages
│       │   ├── tables/          # Data tables
│       │   ├── timetable/       # Timetable components
│       │   ├── leave/           # Leave management
│       │   └── ui/              # Shadcn UI components
│       ├── pages/
│       │   ├── admin/           # Admin specific pages
│       │   ├── constraints/     # Constraint management
│       │   ├── faculty/         # Faculty management
│       │   ├── rooms/           # Room management
│       │   ├── section/         # Section management
│       │   ├── subjects/        # Subject management
│       │   └── Index.tsx        # Landing page
│       ├── context/             # React Context API
│       ├── lib/                 # Utilities (api, icsUtils, utils)
│       ├── types/               # TypeScript types
│       └── main.tsx             # Entry point
│
├── frontend-faculty/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── components/          # Reusable components
│       ├── pages/               # Faculty pages
│       ├── context/             # Context providers
│       ├── lib/                 # Utilities
│       ├── types/               # TypeScript types
│       └── main.tsx             # Entry point
│
└── README.md                    # This file
```

---

## 📚 Component Documentation

- **[Backend README](./backend/scheduler/README.md)**: Detailed backend architecture, API documentation, and setup instructions
- **[Frontend Admin README](./frontend-admin/README.md)**: Admin portal features, component structure, and usage
- **[Frontend Faculty README](./frontend-faculty/README.md)**: Faculty portal features and user guide

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8083/api
```

### Main Endpoints

#### Faculty Management
- `GET /api/faculty` - Get all faculty
- `POST /api/faculty` - Create new faculty
- `GET /api/faculty/{id}` - Get faculty by ID
- `PUT /api/faculty/{id}` - Update faculty
- `DELETE /api/faculty/{id}` - Delete faculty

#### Schedule Management
- `POST /api/schedule/generate` - Generate optimized schedule
- `GET /api/schedule` - Get current schedule
- `PUT /api/schedule/{id}` - Update schedule

#### Leave Management
- `GET /api/leaves` - Get all leave requests
- `POST /api/leaves` - Submit leave request
- `PATCH /api/leaves/{id}/status` - Update leave status

#### Constraints
- `GET /api/constraints` - Get all constraints
- `POST /api/constraints` - Create constraint
- `PUT /api/constraints/{id}` - Update constraint
- `DELETE /api/constraints/{id}` - Delete constraint

#### Resources
- `GET /api/rooms` - Get all rooms
- `GET /api/subjects` - Get all subjects
- `GET /api/sections` - Get all sections

#### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement

*For complete API documentation, refer to [Backend README](./backend/scheduler/README.md)*

---

## 🛠️ Development

### Building

#### Backend
```bash
cd backend/scheduler
./mvnw clean install
./mvnw spring-boot:run
```

#### Frontend Admin
```bash
cd frontend-admin
bun install
bun dev
```

#### Frontend Faculty
```bash
cd frontend-faculty
bun install
bun dev
```

### Testing

#### Backend Tests
```bash
cd backend/scheduler
./mvnw test
```

#### Frontend Tests
```bash
cd frontend-admin
bun test              # or npm test
bun test:watch       # or npm run test:watch
```

### Linting

#### Frontend
```bash
cd frontend-admin
bun lint              # or npm run lint

cd frontend-faculty
bun lint              # or npm run lint
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (`application.properties`)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/scheduler_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# Server
server.port=8083
server.servlet.context-path=/

# CORS
cors.allowed-origins=http://localhost:8080,http://localhost:8081
```

#### Frontend
Create `.env` files in `frontend-admin` and `frontend-faculty`:
```env
VITE_API_URL=http://localhost:8083/api
VITE_APP_NAME=Academic Scheduling System
```

---

## 📋 Database Schema

The system uses the following main entities:
- **Faculty**: Teaching staff with qualifications and availability
- **Subject**: Academic courses/subjects
- **Section**: Class sections
- **Room**: Classroom/lecture halls
- **Slot**: Time slots for scheduling
- **Schedule**: Generated timetable entries
- **Constraint**: Scheduling rules and restrictions
- **Leave**: Faculty leave requests and approvals
- **Announcement**: Institutional announcements

---

## 🔐 Security Features

- **Authentication**: Spring Security with JWT tokens (if implemented)
- **Authorization**: Role-based access control (Admin, Faculty)
- **Input Validation**: Comprehensive validation at DTO and controller level
- **CORS**: Configured for frontend applications
- **Database**: Password-protected PostgreSQL with proper access controls

---

## 📊 Key Algorithms

### Schedule Optimization
- Multi-objective optimization balancing multiple constraints
- Conflict detection and resolution
- Faculty workload distribution

### Constraint Handling
- Three-level priority system (Mandatory, Preferred, Optional)
- Dynamic constraint enablement/disablement
- Weight-based optimization

---

## 🚧 Roadmap

- [ ] Enhanced ML-based workload prediction
- [ ] Mobile app for faculty
- [ ] Advanced analytics dashboard
- [ ] Batch scheduling operations
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Email notifications
- [ ] Multi-language support

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👥 Team

- **Project**: Automated Timetable Scheduling and Faculty Workload Optimization System
- **Type**: Full-Stack Web Application
- **Status**: Active Development

---

## 📞 Support & Contact

For questions, issues, or suggestions:
- Review component-specific READMEs
- Check inline code documentation
- Refer to backend API documentation

---

## 📖 Additional Resources

- [Backend Documentation](./backend/scheduler/README.md)
- [Admin Frontend Documentation](./frontend-admin/README.md)
- [Faculty Frontend Documentation](./frontend-faculty/README.md)

---
