Automated Timetable Scheduling and Faculty Workload Optimization System

This project is a full-stack web application designed to automate academic timetable generation while efficiently managing faculty workloads using configurable scheduling constraints.

Project Overview

Manual timetable creation is time-consuming and prone to conflicts. This system provides a centralized platform where administrators can define scheduling rules, manage resources, and generate optimized timetables while ensuring fairness and constraint compliance.

Technologies Used

Frontend
React (Vite)
JavaScript / JSX
Tailwind CSS
React Router
Axios
Backend
Spring Boot
Java
REST APIs
Spring Data JPA
Database
PostgreSQL

Features
Constraint management with priority levels
Mandatory
Preferred
Optional
Enable / disable constraints dynamically

Faculty workload optimization

Resource management (faculty, rooms, subjects, sections)

Admin dashboard with statistics

Scalable REST-based architecture

Project Structure
Frontend
src/
├── components/
├── pages/
│   └── admin/
│       ├── ConstraintsPage.jsx
│       ├── AddConstraintPage.jsx
│       └── EditConstraintPage.jsx
├── services/
├── lib/
└── App.jsx

Backend
src/main/java/
├── controller/
├── service/
├── repository/
├── entity/
└── SchedulerApplication.java

Constraint Logic

Mandatory constraints must always be satisfied and are never violated.

Preferred constraints are applied when possible but may be relaxed.

Optional constraints are applied only if they do not conflict with higher-priority rules.

How to Run the Application
Backend
mvn clean install
mvn spring-boot:run

Runs on http://localhost:8080

Frontend
npm install
npm run dev

Runs on http://localhost:5173

Database Configuration

PostgreSQL is used as the primary database. Configuration can be updated in application.properties.

Future Enhancements

Automatic timetable generation algorithm

Conflict visualization

Role-based authentication

Export timetables as PDF/Excel

Analytics and reporting module

Status

The project is currently under development with core frontend and backend modules implemented.