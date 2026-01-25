const express = require("express");

const app = express();

// middleware
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("CLT backend is running");
});

// server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
