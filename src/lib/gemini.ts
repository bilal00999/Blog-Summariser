export async function extractFromGemini(rawHtml: string): Promise<string> {
  const prompt = `Extract only the main blog content from the following HTML (ignore ads, navbars, etc):\n\n${rawHtml}`;
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
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );
  const data = await result.json();
  if (!result.ok) {
    throw new Error(data.error?.message || "Gemini API error");
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No content found";
}

export async function summariseText(text: string): Promise<string> {
  const prompt = `Summarise the following blog in simple and short language:\n\n${text}`;
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
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );
  const data = await result.json();
  if (!result.ok) {
    throw new Error(data.error?.message || "Gemini API error");
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary found";
}
