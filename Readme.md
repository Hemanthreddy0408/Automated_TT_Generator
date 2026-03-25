# Academic Timetable Management System

A full-stack academic scheduling platform designed to automate timetable generation, optimize faculty workload, and manage institutional scheduling resources.

The system provides dedicated dashboards for administrators and faculty members while maintaining a scalable backend that handles scheduling algorithms, constraints, and resource management.

---

# Project Overview

Academic institutions often struggle with manual timetable creation, which leads to scheduling conflicts, inefficient resource utilization, and uneven faculty workload distribution.

This system solves those challenges by providing:

- Automated timetable generation
- Constraint-based scheduling
- Faculty workload optimization
- Resource management
- Leave management
- Real-time analytics and insights

The platform is built using a **modern full-stack architecture** with a Spring Boot backend and React frontends.

---

# System Architecture

```

                    Faculty Portal (React)
                           │
                           │
Admin Portal (React) ─── REST API (Spring Boot)
                           │
                           │
                    Business Logic Layer
                           │
                           │
                     PostgreSQL Database

```

The system follows a **layered architecture** that separates concerns between frontend applications, backend services, and the database layer.

---

# Core Modules

## Backend API

Spring Boot based RESTful service responsible for:

- timetable generation algorithms
- faculty workload calculation
- scheduling constraints validation
- leave management
- announcements
- database persistence

Full documentation available in:

```

backend/README.md

```

---

## Admin Portal

A web dashboard designed for institutional administrators to manage scheduling operations.

Key capabilities include:

- managing faculty, rooms, subjects, and sections
- defining scheduling constraints
- generating optimized timetables
- monitoring faculty workload
- approving leave requests
- viewing scheduling analytics

Documentation:

```

frontend-admin/README.md

```

---

## Faculty Portal

A dedicated interface for faculty members to interact with the scheduling system.

Faculty can:

- view their personal timetable
- track teaching workload
- submit leave requests
- download schedules
- receive institutional announcements

Documentation:

```

frontend-faculty/README.md

```

---

# Technology Stack

## Backend
- Java  
- Spring Boot  
- Spring Data JPA  
- Hibernate  
- PostgreSQL  

## Frontend
- React  
- Vite  
- Tailwind CSS  
- Axios  

## Other Tools
- Maven  
- Git  
- REST APIs  

---

# Key Features

## Intelligent Scheduling
- algorithm-based timetable generation
- constraint-aware optimization
- conflict detection and resolution

## Resource Management
- faculty records
- classroom allocation
- subject and section management

## Faculty Workload Optimization
- balanced distribution of teaching hours
- workload analytics

## Leave Management
- leave request submission
- approval workflow

## Constraint-Based Scheduling

Three levels of constraints:

- Mandatory
- Preferred
- Optional

## Analytics Dashboard
- schedule quality metrics
- room utilization
- workload insights

---

# Project Structure

```

academic-scheduler/
│
├── backend/
│   └── Spring Boot API
│
├── frontend-admin/
│   └── Administrator dashboard
│
├── frontend-faculty/
│   └── Faculty dashboard
│
└── README.md

```

Each module contains its own documentation and setup instructions.

---

# Quick Start

## 1 Clone the repository

```

git clone <repository-url>
cd academic-scheduler

```

---

## 2 Start Backend

```

cd backend
mvn spring-boot:run

```

Backend runs at:

```

[http://localhost:8083](http://localhost:8083)

```

---

## 3 Start Admin Portal

```

cd frontend-admin
npm install
npm run dev

```

Admin dashboard runs at:

```

[http://localhost:5173](http://localhost:5173)

```

---

## 4 Start Faculty Portal

```

cd frontend-faculty
npm install
npm run dev

```

Faculty portal runs at:

```

[http://localhost:8081](http://localhost:8081)

```

# License

This project is intended for academic and educational use.

---

# Author

Developed as part of an academic scheduling system project.
