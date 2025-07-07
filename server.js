const mongoose = require("mongoose");

const { configureApp } = require("./config/appConfig");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs")

const app = configureApp();

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

app.get("/ping", (req, res) => {
  res.status(204).end(); 
});

app.get("/api/ping", (req, res) => {
  res.send("Kriya Cron Job Manager API is running");
});

app.get('/api/health', async (req, res) => {
  try {
    // Ping the DB to check connection
    await mongoose.connection.db.admin().ping();

    res.status(200).json({ status: 'ok', message: 'MongoDB is connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'MongoDB is NOT connected', error: err.message });
  }
});

app.use("/", authRoutes);
app.use("/auth", authRoutes);
app.use('/api/job',jobRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 