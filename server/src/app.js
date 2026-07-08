const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global API Rate Limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation Error', details: err.message });
  }
  
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate record exists.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`[Server] MindBridge AI API running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
