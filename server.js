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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kriya Cron Job Manager API is running' });
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