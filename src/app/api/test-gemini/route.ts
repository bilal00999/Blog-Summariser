export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Summarise what Gemini API does in simple words." },
              ],
            },
          ],
        }),
      },
    );

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error?.message || "Gemini API error");
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary found";

    return Response.json({ summary: text });
  } catch (error) {
    console.error("Gemini REST Error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
