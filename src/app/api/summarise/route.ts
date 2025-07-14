import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { load } from "cheerio";
import { supabase } from "@/lib/supabase";
import clientPromise from "@/lib/mongodb";

// Translate to Urdu using MyMemory API
async function translateToUrdu(text: string): Promise<string> {
  try {
    const encodedText = encodeURIComponent(text);
    const response = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ur`
    );
    if (response.data.responseStatus === 200) {
      return response.data.responseData.translatedText;
    } else {
      throw new Error("Translation failed");
    }
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json(
        { error: "Missing required field: url" },
        { status: 400 }
      );
    }

    // Scrape blog content
    let html: string;
    try {
      const res = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html",
        },
      });
      html = res.data;
    } catch (fetchError) {
      console.error("Error fetching blog content:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch blog content", details: String(fetchError) },
        { status: 500 }
      );
    }

    const $ = load(html);
    const paragraphs = $("p")
      .map((_, el) => $(el).text())
      .get();
    const fullText = paragraphs.join("\n");
    const summaryLines = paragraphs.slice(0, 5);
    const englishSummary = summaryLines.join(" ").slice(0, 500);
    if (!englishSummary.trim()) {
      return NextResponse.json(
        { error: "Could not extract summary from blog" },
        { status: 500 }
      );
    }
    const urduSummary = await translateToUrdu(englishSummary);

    // Store summary in Supabase
    let supabaseError = null;
    try {
      const { error } = await supabase.from("summaries").insert({
        url,
        english_summary: englishSummary,
        urdu_summary: urduSummary,
        created_at: new Date().toISOString(),
      });
      if (error) {
        supabaseError = error;
        console.error("Supabase error:", error);
      }
    } catch (err) {
      supabaseError = err;
      console.error("Supabase error:", err);
    }
    if (supabaseError) {
      console.error(
        "Full Supabase error details:",
        JSON.stringify(supabaseError, null, 2)
      );
      return NextResponse.json(
        {
          error: "Failed to insert into Supabase",
          details: String(supabaseError),
        },
        { status: 500 }
      );
    }

    // Store full blog text in MongoDB
    let mongoResult = null;
    let mongoError = null;
    try {
      const client = await clientPromise;
      if (client) {
        const db = client.db(process.env.MONGODB_DB || "blog-summariser");
        const collection = db.collection("blog-contents");
        mongoResult = await collection.insertOne({
          url,
          fullText,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      mongoError = error;
      console.error("MongoDB error:", error);
      // Don't fail the entire request if MongoDB fails
    }

    return NextResponse.json({
      url,
      summary: englishSummary,
      urduSummary,
      mainText: fullText,
      message: mongoError
        ? "Summary saved in Supabase, but MongoDB failed"
        : "Summary saved in Supabase and full blog text saved in MongoDB successfully",
      mongoResultId: mongoResult?.insertedId,
      mongoError: mongoError ? String(mongoError) : null,
    });
  } catch (err) {
    let errorMsg = "Failed to process request";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
