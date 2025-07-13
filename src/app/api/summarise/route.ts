import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { load } from "cheerio";

// Function to translate text to Urdu using MyMemory Translation API
async function translateToUrdu(text: string): Promise<string> {
  try {
    // Use MyMemory Translation API (free service)
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
    // Fallback: return original text if translation fails
    return text;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Fetch blog HTML
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const $ = load(html);

    // Extract main text (all paragraphs)
    const paragraphs = $("p")
      .map((_: number, el: HTMLElement) => $(el).text())
      .get();
    const mainText = paragraphs.join("\n");

    // Summarise: first 3–5 lines, limit to 500 chars
    const summaryLines = paragraphs.slice(0, 5);
    const summary = summaryLines.join(" ");
    const maxLength = 500;
    const summaryToReturn = summary.slice(0, maxLength);

    if (!summaryToReturn.trim()) {
      return NextResponse.json(
        { error: "Summary is empty, cannot summarise", mainText },
        { status: 500 }
      );
    }

    // Translate summary to Urdu
    const urduSummary = await translateToUrdu(summaryToReturn);

    return NextResponse.json({
      summary: summaryToReturn,
      urduSummary,
      mainText,
      url,
    });
  } catch (err: unknown) {
    let errorMsg = "Failed to summarise";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
