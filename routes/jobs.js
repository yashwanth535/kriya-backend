const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobLogs,
  testCallBack,
  runJob
} = require('../controllers/jobController');
// Job CRUD operations
router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/test-callback',testCallBack);

// Job logs and execution
router.get('/:id/logs', getJobLogs);

// Run all jobs (cron-like trigger)
router.post('/run-all', runJob);

module.exports = router; 