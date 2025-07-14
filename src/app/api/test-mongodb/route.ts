import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;

    if (!client) {
      return NextResponse.json(
        {
          status: "error",
          message: "MongoDB not configured",
        },
        { status: 500 }
      );
    }

    const db = client.db(process.env.MONGODB_DB || "blog-summariser");
    const collection = db.collection("blog-contents");

    // Test the connection by trying to count documents
    const count = await collection.countDocuments();

    return NextResponse.json({
      status: "success",
      message: "MongoDB connection working!",
      database: process.env.MONGODB_DB || "blog-summariser",
      collection: "blog-contents",
      documentCount: count,
    });
  } catch (err: unknown) {
    let errorMsg = "Failed to test MongoDB connection";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return NextResponse.json(
      {
        status: "error",
        message: errorMsg,
        error: err,
      },
      { status: 500 }
    );
  }
}
