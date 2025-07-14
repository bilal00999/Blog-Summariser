import { MongoClient } from "mongodb";

// Database types for TypeScript
export interface BlogContent {
  _id?: string;
  url: string;
  fullText: string;
  createdAt?: Date;
}

export interface BlogContentInsert {
  url: string;
  fullText: string;
}

// Check if MongoDB is configured
const isMongoConfigured =
  process.env.MONGODB_URI &&
  process.env.MONGODB_URI !== "your_mongodb_connection_string";

let clientPromise: Promise<MongoClient | null>;

if (!isMongoConfigured) {
  console.log(
    "MongoDB URI not configured, MongoDB functionality will be disabled"
  );
  clientPromise = Promise.resolve(null);
} else {
  console.log("MongoDB URI configured, attempting to connect...");
  console.log("Database name:", process.env.MONGODB_DB);
  const uri = process.env.MONGODB_URI!;
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // Fix SSL issues with correct MongoDB options
    ssl: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  };

  let client: MongoClient;

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
