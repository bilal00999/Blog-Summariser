import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    const client = await clientPromise;
    if (!client) {
      return NextResponse.json(
        { error: "MongoDB not configured" },
        { status: 500 }
      );
    }
    const db = client.db(process.env.MONGODB_DB || "blog-summariser");
    const collection = db.collection("blog-contents");

    if (url) {
      // Get specific blog content by URL
      const data = await collection.findOne({ url });

      if (!data) {
        return NextResponse.json(
          { error: "Blog content not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    } else {
      // Get all blog contents (limit to 50 for performance)
      const data = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      return NextResponse.json(data);
    }
  } catch (err: unknown) {
    let errorMsg = "Failed to fetch blog contents";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
