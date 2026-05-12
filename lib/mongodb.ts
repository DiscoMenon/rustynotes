import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseModule = typeof mongoose;

interface MongooseGlobalCache {
  conn: MongooseModule | null;
  promise: Promise<MongooseModule> | null;
}

declare global {
  // Persisted across Next.js App Router hot reloads in development.
  // eslint-disable-next-line no-var -- global augmentation for connection cache
  var mongoose: MongooseGlobalCache | undefined;
}

function getCache(): MongooseGlobalCache {
  if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
  }
  return global.mongoose;
}

/**
 * Returns a singleton Mongoose instance connected to MongoDB.
 * Reuses the connection across requests and survives dev HMR via `global.mongoose`.
 */
export async function connectMongoDB(): Promise<MongooseModule> {
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Define it in .env.local for local development or your deployment environment.',
    );
  }

  const cached = getCache();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default connectMongoDB;
