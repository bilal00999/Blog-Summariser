"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [urduSummary, setUrduSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mainText, setMainText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary(null);
    setUrduSummary(null);
    setMainText(null);
    try {
      const res = await fetch("/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to summarise");
        setSummary(data.summary || null);
        setUrduSummary(data.urduSummary || null);
        setMainText(data.mainText || null);
        setLoading(false);
        return;
      }
      setSummary(data.summary);
      setUrduSummary(data.urduSummary);
      setMainText(data.mainText);
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">
      {/* Header */}
      <header className="w-full flex flex-col md:grid md:grid-cols-3 items-center px-2 md:px-8 py-2 bg-black text-center md:text-left">
        {/*Logo + BS */}
        <div className="flex items-center gap-2 justify-center md:justify-start w-full md:w-auto mb-2 md:mb-0">
          <img
            src="/Vector.png"
            alt="Logo"
            className="h-8 w-8 md:h-12 md:w-12"
          />
          <span className="font-bold text-2xl md:text-4xl tracking-wide">
            BS
          </span>
        </div>
        {/* BLOG SUMMARIZER + logo */}
        <div className="flex flex-row justify-center items-center gap-2 w-full md:w-auto">
          <span className="font-bold tracking-wider text-center text-lg sm:text-2xl md:text-[32px] leading-tight">
            BLOG SUMMARIZER
          </span>
          <img
            src="/Vector.png"
            alt="Logo"
            className="h-8 w-8 md:h-12 md:w-12"
          />
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 md:px-4 py-8 w-full">
        <h1
          className="font-extrabold text-center mb-2 mt-8 tracking-widest leading-[1.2] text-2xl sm:text-4xl md:text-6xl px-2"
          style={{ fontFamily: "Poppins, Arial, sans-serif" }}
        >
          Summarize any Blog
          <br />
          in a click
        </h1>
        <p className="text-center text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-2xl px-2">
          BS This helps you summarize any blog into a clear, concise format
          <br />
          so you can save time, stay focused.
        </p>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-2 items-center max-w-[800px]"
          style={{ width: "100%" }}
        >
          <div className="text-center" style={{ fontSize: "24px" }}>
            Paste your blog URL — we’ll do the reading and give you the summary!
          </div>
          <label htmlFor="url" className="sr-only">
            Paste your blog URL
          </label>
          <div className="relative w-full flex flex-col items-center">
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://link-to-your-blog"
              className="rounded px-4 py-3 outline-none transition-colors duration-200 w-full"
              style={{
                maxWidth: "800px",
                background: "#000",
                border: "2px solid #8FA1A3",
                color: "#8FA1A3",
                fontSize: "1.1rem",
                caretColor: "#8FA1A3",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#8FA1A3";
                e.currentTarget.style.background = "#000";
                e.currentTarget.style.color = "#8FA1A3";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#8FA1A3";
                e.currentTarget.style.background = "#000";
                e.currentTarget.style.color = "#8FA1A3";
              }}
              autoComplete="on"
            />
            <div className="w-full flex justify-end ml-0 mt-3 pr-0 md:ml-14 md:pr-[5%]">
              <button
                type="submit"
                className="bg-[#5D5CFF] hover:bg-[#679eff] text-white px-4 py-2 rounded font-semibold transition text-sm w-full md:w-auto"
                disabled={loading}
                style={{ minWidth: "140px" }}
              >
                {loading ? "Summarizing..." : "Summarize This"}
              </button>
            </div>
          </div>
        </form>
        {error && <div className="text-red-400 mt-4">{error}</div>}
        {(summary || urduSummary || mainText) && (
          <div className="w-full flex flex-col gap-6 items-center mt-8 px-2">
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-[800px] justify-center">
              {/* English Summary Box */}
              <div
                className="rounded px-4 py-3 outline-none transition-colors duration-200 w-full md:w-[400px]"
                style={{
                  maxWidth: "400px",
                  background: "#000",
                  border: "2px solid #8FA1A3",
                  color: "#8FA1A3",
                  fontSize: "1.1rem",
                  minHeight: "120px",
                }}
              >
                <div
                  className="font-semibold text-lg mb-2"
                  style={{ color: "#8FA1A3" }}
                >
                  English Summary
                </div>
                {summary ? (
                  <div
                    className="whitespace-pre-line text-base"
                    style={{ color: "#8FA1A3" }}
                  >
                    {summary}
                  </div>
                ) : (
                  <div className="italic" style={{ color: "#8FA1A3" }}>
                    No summary yet
                  </div>
                )}
              </div>
              {/* Urdu Summary Box */}
              <div
                className="rounded px-4 py-3 outline-none transition-colors duration-200 w-full md:w-[400px]"
                style={{
                  maxWidth: "400px",
                  background: "#000",
                  border: "2px solid #8FA1A3",
                  color: "#8FA1A3",
                  fontSize: "1.1rem",
                  minHeight: "120px",
                }}
              >
                <div
                  className="font-semibold text-lg mb-2"
                  style={{ color: "#8FA1A3" }}
                >
                  Urdu Summary
                </div>
                {urduSummary ? (
                  <div
                    className="whitespace-pre-line text-base"
                    dir="rtl"
                    lang="ur"
                    style={{ color: "#8FA1A3" }}
                  >
                    {urduSummary}
                  </div>
                ) : (
                  <div className="italic" style={{ color: "#8FA1A3" }}>
                    No summary yet
                  </div>
                )}
              </div>
            </div>
            {/* Full Blog Text Box */}
            <div
              className="rounded px-4 py-3 outline-none transition-colors duration-200 w-full max-w-[800px] relative"
              style={{
                background: "#000",
                border: "2px solid #8FA1A3",
                color: "#8FA1A3",
                fontSize: "1.1rem",
                minHeight: "180px",
                overflowX: "auto",
              }}
            >
              <div
                className="font-semibold text-lg mb-2"
                style={{ color: "#8FA1A3" }}
              >
                Full Blog Text
              </div>
              {mainText ? (
                <div
                  className="whitespace-pre-line text-base"
                  style={{
                    color: "#8FA1A3",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {mainText}
                </div>
              ) : (
                <div className="italic" style={{ color: "#8FA1A3" }}>
                  No blog text available
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
