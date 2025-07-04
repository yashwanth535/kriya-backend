const Job = require("../models/Job");
const { verifyToken } = require("../middleware/jwt");

// Extract userId from cookie
const getUserIdFromCookie = (req) => {
  const token = req.cookies.id;
  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded?.userId || null;
};

// Create a new job
const createJob = async (req, res) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { name, description, cronExpression, callbackUrl, method, body } = req.body;
    const job = new Job({
      name,
      description,
      cronExpression,
      callbackUrl,
      method: method || 'GET',
      body: method === 'POST' ? body : '',
      userId
    });

    await job.save();

    res.status(201).json({
      message: "Job created successfully",
      job
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ error: "Error creating job" });
  }
};

// Get all jobs for a user
const getJobs = async (req, res) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Error fetching jobs" });
  }
};

// Get a specific job
const getJob = async (req, res) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const job = await Job.findOne({ _id: req.params.id, userId });
    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ error: "Error fetching job" });
  }
};

// Update a job
const updateJob = async (req, res) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { name, description, cronExpression, callbackUrl, isActive, method, body } = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId },
      { name, description, cronExpression, callbackUrl, isActive, method: method || 'GET', body: method === 'POST' ? body : '' },
      { new: true }
    );

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ error: "Error updating job" });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, userId });
    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ error: "Error deleting job" });
  }
};

// Get last 10 logs of a job
const getJobLogs = async (req, res) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const job = await Job.findOne(
      { _id: req.params.id, userId },
      { logs: { $slice: -10 } } // fetch only last 10 logs
    );

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json({ logs: job.logs });
  } catch (error) {
    console.error("Fetch job logs error:", error);
    res.status(500).json({ error: "Error fetching logs" });
  }
};

const axios = require('axios');

const testCallBack = async (req, res) => {
  const { callbackUrl, method, body } = req.body;
  if (!callbackUrl || typeof callbackUrl !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid callback URL' });
  }
  try {
    let response;
    if (method === 'POST') {
      let parsedBody = {};
      try {
        parsedBody = body ? JSON.parse(body) : {};
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
      }
      response = await axios.post(callbackUrl, parsedBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
    } else {
      console.log("get testing");
      response = await axios.get(callbackUrl, { timeout: 5000 });
    }
    if (response.status >= 200 && response.status < 300) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({
        success: false,
        message: `Callback responded with status ${response.status}`
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to reach callback URL: ${error.message}`
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobLogs,
  testCallBack,
};

