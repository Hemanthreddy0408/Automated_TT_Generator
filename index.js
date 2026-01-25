const express = require("express");

const adminRoutes = require("./routes/admin.routes");
const facultyRoutes = require("./routes/faculty.routes");
const timetableRoutes = require("./routes/timetable.routes");

const app = express();

// middleware
app.use(express.json());

// routes
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/timetable", timetableRoutes);

// server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
