# Frontend Admin Portal - Academic Timetable Management

> Professional React-based administrator dashboard for managing academic timetables, resources, constraints, and faculty workload optimization.

---

## 🎯 Overview

The Admin Portal is a comprehensive web application designed for administrators to:
- Manage academic resources (faculty, rooms, subjects, sections)
- Define and enforce scheduling constraints with priority levels
- Generate and optimize academic timetables
- Monitor faculty workload distribution
- Review and approve leave requests
- Access analytics and optimization insights
- Broadcast institutional announcements

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

## 🚀 Installation & Setup

### Navigate to Project Directory
```bash
cd frontend-admin
```

### Install Dependencies
```bash
bun install        # Using Bun (recommended)
npm install        # Using npm
yarn install       # Using yarn
```

### Configure Environment Variables
Create `.env.local`:
```env
VITE_API_URL=http://localhost:8083/api
VITE_APP_NAME=Academic Timetable Management System
VITE_DEBUG=false
```

### Start Development Server
```bash
bun dev            # Using Bun
npm run dev        # Using npm
```

**Application URL**: `http://localhost:8080`

---

## 📚 Main Features

### Resource Management
- Add, edit, and delete faculty, rooms, subjects, and sections
- Track faculty workload and availability
- Manage room capacity and equipment

### Constraint Management
- Define constraints with three priority levels (Mandatory, Preferred, Optional)
- Enable/disable constraints dynamically
- Set custom weights and priorities
- Real-time constraint validation

### Schedule Generation
- Trigger intelligent optimization algorithm
- View generated timetable with color coding
- Identify and resolve scheduling conflicts
- Export schedules in multiple formats

### Leave Management
- Review and approve leave requests
- Filter by status and date range
- Provide feedback on rejections
- Track approval history

### Analytics Dashboard
- Real-time schedule quality metrics
- Faculty workload distribution charts
- Room utilization analysis
- Constraint satisfaction reports

### Additional Features
- Create and manage institutional announcements
- Export data and reports (PDF, Excel, CSV)
- Real-time search and filtering
- Responsive mobile-friendly design

---

## 🔧 Development Guide

### Adding a New Page
1. Create component in `pages/`
2. Add route in `App.tsx`
3. Add navigation in `Sidebar.tsx`

### API Integration
Use axios client in `lib/api.ts` for all backend calls.

---

## 🛠️ Building for Production
```bash
bun run build      # Using Bun
npm run build      # Using npm
```

Generated files in `dist/` folder.

---

## 📞 Support

For issues or questions, refer to the main project README.

---

**Version**: 1.0.0 | **Last Updated**: February 2026