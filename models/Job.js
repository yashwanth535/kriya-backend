const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  responseCode: {
    type: Number
  },
  responseBody: {
    type: String
  },
  errorMessage: {
    type: String
  }
}, { _id: false }); // no need for _id in subdocs

const jobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  cronExpression: {
    type: String,
    required: true,
    trim: true
  },
  callbackUrl: {
    type: String,
    required: true,
    trim: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST'],
    default: 'GET'
  },
  body: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastExecuted: {
    type: Date,
    default: null
  },
  logs: {
    type: [logSchema],
    default: []
  },
  nextRun: {
    type: Date,
    default: null
  }  
},{ versionKey: false });

module.exports = mongoose.model('Job', jobSchema);
