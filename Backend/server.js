require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const connectDB = require("./config/db");

// Routes
const resumeRoutes = require("./routes/resumeRoutes");
const homeRoutes = require("./routes/homeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

connectDB();

app.use(cors());          // <-- ADD THIS
app.use(express.json());


app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});
// Routes
app.use("/api/resume", resumeRoutes);
app.use("/", homeRoutes);
app.use("/api/interview", interviewRoutes);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});