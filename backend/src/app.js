import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { ENV } from './config/env.js';

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: ENV.CLIENT_URL === '*' ? '*' : [ENV.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Root Info
app.get('/api', (req, res) => {
  res.json({
    name: 'RentEase Backend API',
    version: '1.0.0',
    description: 'Furniture, appliance and electronics rental marketplace API',
    status: 'online',
    documentation: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      products: {
        list: 'GET /api/products',
        details: 'GET /api/products/:id',
      },
    },
  });
});

// Mount Routes
app.use('/api', routes);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
