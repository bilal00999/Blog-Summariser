export async function GET() {
  try {
    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
      }
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
