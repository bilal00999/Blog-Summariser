import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;

    if (!client) {
      return NextResponse.json({
        status: "MongoDB not configured",
        configured: false,
      });
    }

    // Try to connect
    const admin = client.db().admin();
    const status = await admin.ping();

    // Get stored data
    const db = client.db(process.env.MONGODB_DB || "blog-summariser");
    const collection = db.collection("blog-contents");
    const count = await collection.countDocuments();
    const latestDocs = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      status: "✓ MongoDB connected",
      connected: true,
      ping: status,
      database: process.env.MONGODB_DB || "blog-summariser",
      collection: "blog-contents",
      totalDocuments: count,
      recentDocuments: latestDocs.map((doc: any) => ({
        _id: doc._id,
        url: doc.url,
        createdAt: doc.createdAt,
        textLength: doc.fullText?.length || 0,
      })),
    });
  } catch (error) {
    console.error("MongoDB check error:", error);
    return NextResponse.json(
      {
        status: "✗ MongoDB connection failed",
        connected: false,
        error: String(error),
      },
      { status: 500 },
    );
  }
}
