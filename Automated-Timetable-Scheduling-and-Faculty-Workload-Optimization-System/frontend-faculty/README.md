# Frontend Faculty Portal - Academic Timetable Management

> User-friendly React-based dashboard for faculty members to view schedules, manage leave requests, and track workload in the academic scheduling system.

---

## 🎯 Overview

The Faculty Portal empowers faculty members to:
- View assigned courses and personal class schedules
- Monitor workload distribution and teaching hours
- Submit and track leave requests
- Download schedules in multiple formats (PDF, Excel, ICS)
- Access institutional announcements and deadlines
- View personal performance metrics and analytics

---

## ✨ Features

### Personal Dashboard
- Quick statistics (courses, hours per week, total students)
- Workload distribution charts
- Upcoming classes for next 7 days
- Recent announcements feed
- Key performance indicators

### Schedule Management
- Weekly and monthly timetable views
- Detailed course information
- Room location and timing
- Student enrollment details
- Search and filter functionality

### Leave Management
- Submit leave requests (Medical, Personal, Academic)
- Track request status (Pending, Approved, Rejected)
- View remaining leave balance
- Leave calendar view
- Request history and feedback

### Schedule Export
- **PDF**: Print-friendly format for sharing
- **Excel**: Spreadsheet with calculations
- **ICS**: Import to Google Calendar, Outlook, etc.
- Flexible date range selection

### Analytics
- Personal performance metrics
- Total teaching hours analysis
- Course distribution breakdown
- Workload trends and patterns

### Communication
- Announcement feed with filters
- Important deadline tracking
- Department-specific updates
- System notifications

---

## 🚀 Installation & Setup

### Navigate to Project Directory
```bash
cd frontend-faculty
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
VITE_APP_NAME=Faculty Portal
VITE_DEBUG=false
```

### Start Development Server
```bash
bun dev            # Using Bun
npm run dev        # Using npm
```

**Application URL**: `http://localhost:8081`

---

## 📂 Project Structure

```
frontend-faculty/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── timetable/       # Schedule display
│   │   ├── leave/           # Leave management
│   │   └── ui/              # Shadcn UI components
│   ├── pages/
│   │   ├── Dashboard-Faculty.tsx
│   │   ├── FacultySchedule-Faculty.tsx
│   │   ├── LeaveStatus-Faculty.tsx
│   │   ├── Announcements-Faculty.tsx
│   │   └── Index.tsx
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   └── utils.ts         # Utilities
│   ├── types/               # TypeScript types
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 👤 User Guide

### View Your Schedule
1. Navigate to **Schedule** page
2. Use navigation arrows to switch weeks
3. Click on any class for detailed information
4. Check room location and timing

### Submit Leave Request
1. Go to **Leave Management**
2. Click **"Submit New Request"**
3. Select start and end dates
4. Choose leave type
5. Add reason (optional)
6. Click **"Submit"**
7. Check status in **"Leave History"**

### Download Schedule
1. Open **Schedule** page
2. Click **"Download"** button
3. Select format (PDF, Excel, or ICS)
4. Choose date range
5. Click **"Download"**

### Check Analytics
1. Navigate to **Analytics**
2. View personal metrics
3. Compare with department average
4. Export reports if available

---

## 💻 Technology Stack

| Technology | Purpose |
|-----------|---------|
| React 18.3.1 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Shadcn/ui | Components |
| Axios | HTTP client |
| Recharts | Charts |
| jsPDF & XLSX | Export |

---

## 🛠️ Building for Production
```bash
bun run build      # Using Bun
npm run build      # Using npm
```

Output in `dist/` folder ready for deployment.

---

## 🐛 Troubleshooting

### Can't connect to API
- Verify backend is running on `http://localhost:8083`
- Check `VITE_API_URL` in `.env.local`

### Port already in use
```bash
npm run dev -- --port 8082
```

### Missing data
- Clear browser cache
- Restart development server
- Check backend connection

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Version**: 1.0.0 | **Last Updated**: February 2026