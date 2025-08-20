import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachprep';

// MongoDB connection options
const options: mongoose.ConnectOptions = {
  // useNewUrlParser and useUnifiedTopology are now default in Mongoose 6
};

/**
 * Global MongoDB connection interface
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Set global mongoose types
 */
declare global {
  // Use a namespace to avoid duplicate declaration issues
  namespace NodeJS {
    interface Global {
      mongoose: MongooseCache | undefined;
    }
  }
}

/**
 * Global MongoDB connection cache
 */
let cached: MongooseCache = (globalThis as any).mongoose || { conn: null, promise: null };

// Initialize global mongoose cache
if (!(globalThis as any).mongoose) {
  (globalThis as any).mongoose = cached;
}

/**
 * Connect to MongoDB
 */
async function connectDb() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = options;

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDb; 