import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { load } from "cheerio";
import { supabase } from "@/lib/supabase";
import clientPromise from "@/lib/mongodb";
import { extractFromGemini, summariseText } from "@/lib/gemini";

// Translate to Urdu using MyMemory API
async function translateToUrdu(text: string): Promise<string> {
  try {
    // Split text into sentences for better translation reliability
    const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
    const translations = await Promise.all(
      sentences.map(async (sentence) => {
        const encodedText = encodeURIComponent(sentence.trim());
        if (!encodedText) return "";
        try {
          const response = await axios.get(
            `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ur`,
          );
          if (response.data.responseStatus === 200) {
            return response.data.responseData.translatedText;
          } else {
            throw new Error("Translation failed");
          }
        } catch (error) {
          console.error("Translation error for sentence:", sentence, error);
          return sentence; // fallback to original sentence
        }
      }),
    );
    return translations.join(" ");
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
        { status: 400 },
      );
    }

    let mainText = "";
    // Try multiple methods to fetch blog content
    let html: string | null = null;
    let lastFetchStatus: number | null = null;
    let lastFetchError: string | null = null;

    // Method 1: Try with axios and various header combinations
    const headerVariants = [
      {
        // Browser-like headers
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      {
        // Alternative headers
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Cache-Control": "no-cache",
      },
    ];

    for (const headers of headerVariants) {
      try {
        const res = await axios.get(url, {
          headers,
          timeout: 10000,
          maxRedirects: 5,
          validateStatus: () => true, // Accept any status code
        });

        if (res.status >= 200 && res.status < 300) {
          html = res.data;
          console.log(
            `✅ Successfully fetched: ${url} (Status: ${res.status})`,
          );
          break;
        } else if (res.status === 403) {
          lastFetchStatus = res.status;
          lastFetchError = "The target website returned 403 Forbidden";
          console.log(
            `⚠️ Got 403 Forbidden for ${url}, trying alternative headers...`,
          );
          continue;
        } else if (res.status === 404) {
          throw new Error(`URL not found (404): ${url}`);
        } else {
          lastFetchStatus = res.status;
          lastFetchError = `The target website returned status ${res.status}`;
          console.log(
            `⚠️ Got status ${res.status} for ${url}, trying next variant...`,
          );
        }
      } catch (err) {
        lastFetchError = err instanceof Error ? err.message : String(err);
        console.log(
          `❌ Fetch failed:`,
          err instanceof Error ? err.message : String(err),
        );
        continue;
      }
    }

    // If no headers worked, try without auth
    if (!html) {
      console.log(`All header variants failed for ${url}`);
      const blockedBySite = lastFetchStatus === 403;
      return NextResponse.json(
        {
          error: "Failed to fetch blog content",
          reason: blockedBySite
            ? "The website blocked automated requests (403 Forbidden). Try a publicly accessible article or a different source URL."
            : "The website is blocking automated requests or the URL is invalid",
          url,
          suggestion:
            blockedBySite
              ? "Medium often blocks server-side fetches. Try a public blog URL, a RSS/article mirror, or another site that allows scraping."
              : "Try a publicly accessible blog URL (e.g., dev.to, hashnode.com, or your own blog)",
          environment: process.env.NODE_ENV,
          deploymentRegion: "Vercel",
          upstreamStatus: lastFetchStatus,
          upstreamError: lastFetchError,
        },
        { status: blockedBySite ? 403 : 503 },
      );
    }

    // Use Gemini to extract content from HTML
    try {
      mainText = await extractFromGemini(html);
    } catch (geminiError) {
      console.warn(
        "⚠️ Gemini API error (expected if quota exceeded), using Cheerio fallback...",
      );
      if (geminiError instanceof Error) {
        console.warn("Gemini error:", geminiError.message.split("\n")[0]); // Only first line to avoid spam
      }
      // Fallback: Use Cheerio to extract text if Gemini fails
      const $ = load(html);
      const paragraphs = $("p")
        .map((_, el) => $(el).text())
        .get();
      mainText = paragraphs.join("\n");

      if (!mainText.trim()) {
        // Try other selectors
        const articles = $("article").text();
        const main = $("main").text();
        mainText = articles || main || "No text content found";
      }
    }

    // Use Gemini for summarisation
    let englishSummary: string;
    try {
      englishSummary = await summariseText(mainText);
    } catch (summarizeError) {
      console.warn(
        "⚠️ Gemini summarization failed (expected if quota exceeded), using manual extraction...",
      );
      if (summarizeError instanceof Error) {
        console.warn("Summarize error:", summarizeError.message.split("\n")[0]); // Only first line
      }
      // Fallback: Extract key sentences manually
      const sentences = mainText.match(/[^.!?]+[.!?]+/g) || [];
      englishSummary = sentences
        .slice(0, 5) // Take first 5 sentences
        .join(" ")
        .trim();

      if (!englishSummary) {
        englishSummary = mainText.substring(0, 500); // Fallback: first 500 chars
      }
    }

    if (!englishSummary.trim()) {
      return NextResponse.json(
        { error: "Could not extract summary from blog" },
        { status: 500 },
      );
    }
    // Log the English summary
    console.log("English Summary:", englishSummary);
    const urduSummary = await translateToUrdu(englishSummary);
    // Log the Urdu summary
    console.log("Urdu Summary:", urduSummary);
    // Warn if translation failed
    let translationWarning = null;
    if (urduSummary.trim() === englishSummary.trim()) {
      translationWarning =
        "Translation to Urdu may have failed. Returning English summary as fallback.";
      console.warn(translationWarning);
    }

    // Store summary in Supabase (non-blocking - don't fail if this fails)
    let supabaseError = null;
    try {
      const { error } = await supabase.from("Summary").insert({
        url,
        summary: englishSummary,
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

    // Store full blog text in MongoDB (non-blocking)
    let mongoError = null;
    let mongoStored = false;
    try {
      const client = await clientPromise;
      if (client) {
        const db = client.db(process.env.MONGODB_DB || "blog-summariser");
        const collection = db.collection("blog-contents");
        const result = await collection.insertOne({
          url,
          fullText: mainText,
          englishSummary,
          urduSummary,
          createdAt: new Date(),
        });
        if (result.insertedId) {
          mongoStored = true;
          console.log("✓ Stored in MongoDB:", result.insertedId);
        }
      }
    } catch (err) {
      mongoError = err;
      console.error("MongoDB error:", err);
    }

    // Return success with summary regardless of database errors
    const response = {
      url,
      summary: englishSummary,
      urduSummary,
      mainText: mainText, // Return full blog text
      translationWarning,
      message: "Summary generated successfully",
      storedInSupabase: !supabaseError,
      storedInMongoDB: mongoStored,
      supabaseError: supabaseError ? String(supabaseError) : null,
      mongoError: mongoError ? String(mongoError) : null,
      textLength: mainText.length,
      summaryLength: englishSummary.length,
      environment: process.env.NODE_ENV,
    };

    console.log("📤 Response sent:", {
      url,
      textLength: mainText.length,
      summaryLength: englishSummary.length,
      storedInMongoDB: mongoStored,
      storedInSupabase: !supabaseError,
    });

    return NextResponse.json(response);
  } catch (err) {
    let errorMsg = "Failed to process request";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
