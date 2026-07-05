const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

// ===============================
// Connect Database
// ===============================
connectDB();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);
// ===============================
// Home Route
// ===============================
app.get("/", (req, res) => {
  res.send("AI Interview Coach Backend Running 🚀");
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});