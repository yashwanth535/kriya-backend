const mongoose = require("mongoose");

const { configureApp } = require("./config/appConfig");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs")

const startServer = async () => {
  const app = await configureApp();

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


app.get('/api/db', async (req, res) => {
  try {
    const readyState = mongoose.connection.readyState;
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };

    if (readyState !== 1) {
      return res.status(500).json({
        status: "error",
        message: "MongoDB is not connected",
        readyState: stateMap[readyState]
      });
    }

    const db = mongoose.connection.db;
    const collection = db.collection("testdb");

    // Fetch the first (and only) document
    const document = await collection.findOne({});

    if (!document) {
      return res.status(404).json({
        status: "error",
        message: "No document found in collection"
      });
    }

    return res.status(200).json({
      status: "ok",
      message: "MongoDB connected and document fetched",
      readyState: stateMap[readyState],
      document
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "MongoDB query failed",
      error: err.message
    });
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
}
startServer();