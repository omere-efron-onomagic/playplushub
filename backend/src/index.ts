import express, { type NextFunction, type Request, type Response } from 'express';
import 'dotenv/config';
import { connectToMongoDB, startServer } from './utils.js';
import { usersRouter } from './routes/users.routes.js';
import { postsRouter } from './routes/posts.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { walletRouter } from './routes/wallet.routes.js';
import { gamesRouter } from './routes/games.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { getUploadsDir } from './services/upload.service.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import { logger } from './logger/logger.js';
import cors from 'cors';
import helmet from 'helmet';

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const localDefaults = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
  return Array.from(new Set([...fromEnv, ...localDefaults]));
}

const allowedOrigins = getAllowedOrigins();
// create a new express application
const app = express();

// helmet is a middleware that helps to secure the express application by setting various HTTP headers
app.use(helmet());

// cors is a middleware that allows the express application to accept requests from the frontend specifically
// the origin is the URL of the frontend
// credentials: true means that the browser will send the credentials (cookies, authentication tokens, etc.) to the backend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl/postman) that do not send origin.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

// express.json() is a middleware that parses the request body and makes it available in req.body
app.use(express.json());

// express.urlencoded() is a middleware that parses the request body and makes it available in req.body
// extended: true means that the parser will support nested objects and arrays
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

// create a new route that returns a JSON object with a key of ok and a value of true
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// initialize routers
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/auth', authRouter);
app.use('/wallet', walletRouter);
app.use('/games', gamesRouter);
app.use('/admin', adminRouter);
app.use('/uploads', express.static(getUploadsDir()));

// if the route is not found, return a 404 error
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// error handler (must be last)
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('unhandled_error', {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
    method: req.method,
    path: req.path,
  });
  res.status(500).json({ error: 'Internal server error' });
});

// get the port and uri from the environment variables
const port = Number(process.env.PORT) || 3000;
const uri = process.env.MONGODB_URI;

// main function to start the server
async function main() {
  if (uri) {
    try {
      await connectToMongoDB(uri);
    } catch (error) {
      logger.error('MongoDB connection failed, continuing with JSON-backed auth only', { error });
    }
  } else {
    logger.warn('MONGODB_URI is not set, running without MongoDB connection');
  }

  await startServer(app, port);
  logger.info('Server started', { port });
}

// catch any errors and exit the process
main().catch((error: unknown) => {
  logger.error('Failed to start', { error });
  process.exit(1);
});
