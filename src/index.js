import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongo.js';
import routes from './routes/index.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import submissionRouter from './routes/submission.js';
import exerciseRouter from './routes/exercise.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// DB Connections
connectDB();       // MongoDB

// Routes
app.get('/', (req, res) => {
  res.send('Algorithm Learning API is running!');
});
app.use('/api', routes);
app.use('/api/auth', authRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/exercise', exerciseRouter);

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Danh sách các API backend đang hoạt động'
    },
    servers: [{ url: 'http://localhost:5000' }]
  },
  apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Có lỗi xảy ra!' });
});
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route không tồn tại' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
