# Cron Job Manager - Backend

Node.js backend API for the Cron Job Manager. Built with Express, MongoDB, and JWT authentication.

## Features

- 🔐 **JWT Authentication**: Secure user authentication and authorization
- 📊 **MongoDB Integration**: Robust data storage with Mongoose ODM
- ⏰ **Cron Job Management**: Full CRUD operations for cron jobs
- 📝 **Execution Logging**: Detailed logs for job executions
- 🚀 **Vercel Integration**: Native Vercel cron job support
- 🔒 **Security**: Password hashing, CORS, and input validation

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Axios** - HTTP client for job execution

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# PORT=5000

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000`

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cron-job-manager

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Vercel Environment (optional)
VERCEL_ENV=development
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when implemented)

## Project Structure

```
backend/
├── controllers/        # Business logic handlers
│   ├── authController.js    # Authentication logic
│   ├── jobController.js     # Job management logic
│   └── cronController.js    # Cron execution logic
├── middleware/         # Express middleware
│   └── auth.js        # JWT authentication middleware
├── models/            # MongoDB schemas
│   ├── User.js        # User model
│   ├── Job.js         # Job model
│   └── JobLog.js      # Job log model
├── routes/            # API route definitions
│   ├── auth.js        # Authentication routes
│   ├── jobs.js        # Job management routes
│   └── cron.js        # Cron execution routes
├── server.js          # Main server file
├── vercel.json        # Vercel configuration
└── env.example        # Environment variables example
```

## API Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST /api/auth/signin
Sign in to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### GET /api/auth/me
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Jobs

#### GET /api/jobs
Get all jobs for the authenticated user.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "jobs": [
    {
      "_id": "job_id",
      "name": "Daily Backup",
      "description": "Backup database daily",
      "cronExpression": "0 0 * * *",
      "callbackUrl": "https://api.example.com/backup",
      "isActive": true,
      "userId": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastExecuted": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/jobs
Create a new job.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Daily Backup",
  "description": "Backup database daily",
  "cronExpression": "0 0 * * *",
  "callbackUrl": "https://api.example.com/backup"
}
```

#### PUT /api/jobs/:id
Update an existing job.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Updated Job Name",
  "description": "Updated description",
  "cronExpression": "0 0 * * *",
  "callbackUrl": "https://api.example.com/updated",
  "isActive": true
}
```

#### DELETE /api/jobs/:id
Delete a job.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

#### GET /api/jobs/:id/logs
Get execution logs for a job.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "logs": [
    {
      "_id": "log_id",
      "jobId": "job_id",
      "status": "success",
      "executedAt": "2024-01-01T00:00:00.000Z",
      "response": "Job executed successfully",
      "executionTime": 1500
    }
  ]
}
```

#### POST /api/jobs/:id/execute
Execute a job manually.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Cron

#### POST /api/cron/execute-jobs
Execute scheduled jobs (called by Vercel cron).

**Response:**
```json
{
  "message": "Cron jobs processed",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "results": [
    {
      "jobId": "job_id",
      "jobName": "Daily Backup",
      "status": "executed"
    }
  ]
}
```

## Database Models

### User
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String (required),
  createdAt: Date
}
```

### Job
```javascript
{
  name: String (required),
  description: String (required),
  cronExpression: String (required),
  callbackUrl: String (required),
  isActive: Boolean (default: true),
  userId: ObjectId (ref: User, required),
  createdAt: Date,
  lastExecuted: Date
}
```

### JobLog
```javascript
{
  jobId: ObjectId (ref: Job, required),
  status: String (enum: ['success', 'failure', 'pending']),
  executedAt: Date,
  response: String,
  error: String,
  executionTime: Number
}
```

## Vercel Configuration

The `vercel.json` file configures the deployment and cron jobs:

```json
{
  "version": 2,
  "functions": {
    "api/cron/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "crons": [
    {
      "path": "/api/cron/execute-jobs",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs the cron job execution every 5 minutes.

## Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Comprehensive error handling and logging

## Development

### Adding New Endpoints

1. Create the controller function in `controllers/`
2. Add the route in `routes/`
3. Update the main server file if needed

### Database Changes

1. Update the model in `models/`
2. Run database migrations if needed
3. Update related controllers

### Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

The application can be deployed to any Node.js hosting platform:

- Heroku
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

### Environment Variables

Make sure to set the following environment variables in your deployment platform:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `PORT`: Server port (optional, defaults to 5000)

## Monitoring and Logging

- Application logs are output to console
- Job execution logs are stored in the database
- Error handling includes detailed error messages
- Vercel provides built-in monitoring and analytics

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Add tests for new features
5. Update documentation 