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
import exerciseRouter from './routes/exercise.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://algofast-frontend.onrender.com',
  'https://algo-fast-frontend.vercel.app'
];

// Fix CORS headers manually for custom origin function
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Main CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'a2F3Lmn91qweXz7lPQ9vbn5tuERo',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,            // Must be true for HTTPS
    httpOnly: true,
    sameSite: 'None'         // Required for cross-domain cookies
  }
}));

// DB connection
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Algorithm Learning API is running!');
});
app.use('/api', routes);
app.use('/api/auth', authRouter);
app.use('/api/exercise', exerciseRouter);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Danh sách các API backend đang hoạt động'
    },
    servers: [{ url: 'https://algofast-backend.onrender.com' }]
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `html { scroll-behavior: smooth; } body { background-color: #121212 !important; color: #e0e0e0 !important; font-family: 'Inter', sans-serif !important; } .swagger-ui .topbar { background-color: #0d0d0d !important; border-bottom: 1px solid #333; } .swagger-ui .topbar a { color: #fff !important; font-weight: 600; font-size: 1.1rem; } .swagger-ui .info { margin: 20px 0; } .swagger-ui .info hgroup.main { border-left: 5px solid #00BFFF; padding-left: 1rem; background: #1e1e1e; padding: 1rem; border-radius: 0.5rem; } .swagger-ui .info hgroup.main h2 { color: #00BFFF; font-size: 2rem; } .swagger-ui .opblock-summary { background-color: #1e1e1e !important; border-left: 5px solid #00BFFF !important; border-radius: 5px; } .swagger-ui .opblock-summary-method { font-weight: bold; } .swagger-ui .responses-wrapper, .swagger-ui .opblock-section-header { background-color: #1a1a1a !important; border-radius: 0.25rem; } .swagger-ui .opblock-body { background-color: #202020 !important; border-radius: 0.25rem; } .swagger-ui .response-col_description__inner { color: #ccc !important; } .swagger-ui .scheme-container { background: #111; border-radius: 0.25rem; } .swagger-ui .btn { background: #00BFFF !important; color: #000 !important; font-weight: 600; transition: all 0.3s ease; } .swagger-ui .btn:hover { background: #009ACD !important; } .swagger-ui .parameters-col_description, .swagger-ui .parameter__name, .swagger-ui .parameter__type { color: #ccc !important; } .swagger-ui .parameter__name.required { color: #ff5252 !important; } .swagger-ui .tab li button { background: #222; color: #fff; } .swagger-ui .tab li button.active { background: #00BFFF; color: #000; } .swagger-ui .markdown code { background: #333 !important; color: #00e676 !important; }`,
  customSiteTitle: "AlgoFast API Docs",
  swaggerOptions: {
    docExpansion: "none",
    displayRequestDuration: true
  }
}));

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
