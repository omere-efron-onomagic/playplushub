import type { Server } from 'node:http';
import type { Express } from 'express';
import mongoose from 'mongoose';
import { logger } from './logger/logger.js';

// Boots the HTTP server and returns the Server instance.
// Startup failures are propagated to the caller for handling.
export async function startServer(app: Express, port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, (error) => {
      if (error) return reject(error);
      resolve(server);
    });
  });
}

export async function connectToMongoDB(uri: string): Promise<void> {
  try {
    logger.info('Connecting to MongoDB');
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error });
    throw error;
  }
}
