const axios = require('axios');
const cronParser = require('cron-parser');
const Job = require("../models/Job");

const runJob = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true });
    const now = new Date();
    const results = [];

    for (const job of jobs) {
      try {
        const interval = cronParser.parseExpression(job.cronExpression, {
          currentDate: job.lastExecuted || new Date(0),
        });

        const nextRun = interval.next().toDate();

        // Check if the nextRun is within +/-30s window of now
        if (Math.abs(now - nextRun) < 60000) {
          const config = {
            method: job.method,
            url: job.callbackUrl,
            ...(job.method === 'POST' && {
              data: job.body ? JSON.parse(job.body) : {}
            })
          };

          const response = await axios(config);

          const log = {
            timestamp: now.toLocaleString('en-US', { hour12: true }),
            status: 'success',
            responseCode: response.status,
            responseBody: JSON.stringify(response.data).slice(0, 1000),
            errorMessage: ''
          };

          job.logs = [...job.logs, log].slice(-10);
          job.lastExecuted = now;

          // 👇 Calculate and update the new nextRun time
          const nextInterval = cronParser.parseExpression(job.cronExpression, {
            currentDate: now
          });
          job.nextRun = nextInterval.next().toDate();

          await job.save();

          results.push({ 
            job: job.name,
            status: 'success',
            executedAt: now.toLocaleString('en-US', { hour12: true }) 
          });
        } else {
          results.push({ 
            job: job.name,
            status: 'skipped',
            reason: 'Not scheduled to run now',
            currentTime: now.toLocaleString('en-US', { hour12: true })
          });
        }
      } catch (err) {
        const log = {
          timestamp: now.toLocaleString('en-US', { hour12: true }),
          status: 'failure',
          responseCode: err.response?.status || 500,
          responseBody: '',
          errorMessage: err.message
        };

        job.logs = [...job.logs, log].slice(-10);
        job.lastExecuted = now;

        // Update nextRun even if job failed
        try {
          const failInterval = cronParser.parseExpression(job.cronExpression, {
            currentDate: now
          });
          job.nextRun = failInterval.next().toDate();
        } catch (e) {
          job.nextRun = null;
        }

        await job.save();

        results.push({ 
          job: job.name,
          status: 'failure',
          error: err.message,
          failedAt: now.toLocaleString('en-US', { hour12: true })
        });
      }
    }

    res.json({ message: 'Jobs evaluated', results });
  } catch (err) {
    res.status(500).json({ error: 'Error running jobs', details: err.message });
  }
};

module.exports = {
  runJob
};
