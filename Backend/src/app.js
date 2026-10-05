const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const cors = require("cors");
const interviewRouter = require("./routes/interview.routes");
const mockInterviewRoutes = require("./routes/mockInterview.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/mock-interviews", mockInterviewRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Middleware
app.use(errorMiddleware);

module.exports = app;
