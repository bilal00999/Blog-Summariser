"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [urduSummary, setUrduSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mainText, setMainText] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showFullBlog, setShowFullBlog] = useState(false);

  useEffect(() => {
    if (summary && mainText) {
      setShowPopup(true);
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [summary, mainText]);

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
      {/* Popup Notification */}
      {showPopup && (
        <div
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in"
          style={{
            background: "rgba(30,30,30,0.7)",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: "18px",
            boxShadow: "0 0 16px 2px #fff, 0 0 32px 4px #fff2",
            backdropFilter: "blur(8px)",
            padding: "20px 36px",
            fontWeight: 600,
            fontSize: "1.1rem",
            letterSpacing: "0.04em",
            textAlign: "center",
            overflow: "hidden",
            position: "fixed",
            minWidth: "320px",
            maxWidth: "90vw",
            borderImage:
              "linear-gradient(90deg, #fff 0%, #aaa 50%, #fff 100%) 1",
          }}
        >
          <span
            style={{
              background:
                "linear-gradient(90deg, #fff 0%, #eee 50%, #fff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
              fontWeight: 700,
              filter: "drop-shadow(0 0 6px #fff8)",
            }}
          >
            Summary stored in Supabase.
            <br />
            Full blog stored in MongoDB.
          </span>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              background:
                "linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.25) 80%, transparent 100%)",
              animation: "shine 2s linear forwards",
            }}
          />
        </div>
      )}
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
              className="px-4 py-3 outline-none transition-colors duration-200 w-full"
              style={{
                maxWidth: "800px",
                background: "rgba(30,30,30,0.7)",
                border: "2px solid #eee",
                color: "#8FA1A3",
                fontSize: "1.1rem",
                caretColor: "#8FA1A3",
                borderRadius: "18px",
                boxShadow: "0 0 6px 1px #fff, 0 0 12px 2px #fff2",
                backdropFilter: "blur(8px)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#fff";
                e.currentTarget.style.boxShadow =
                  "0 0 12px 2px #fff, 0 0 24px 4px #fff2";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#eee";
                e.currentTarget.style.boxShadow =
                  "0 0 6px 1px #fff, 0 0 12px 2px #fff2";
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
                className="px-4 py-3 outline-none transition-colors duration-200 w-full md:w-[400px]"
                style={{
                  maxWidth: "400px",
                  background: "rgba(30,30,30,0.7)",
                  border: "2px solid #eee",
                  color: "#8FA1A3",
                  fontSize: "1.1rem",
                  minHeight: "120px",
                  borderRadius: "18px",
                  boxShadow: "0 0 6px 1px #fff, 0 0 12px 2px #fff2",
                  backdropFilter: "blur(8px)",
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
                className="px-4 py-3 outline-none transition-colors duration-200 w-full md:w-[400px]"
                style={{
                  maxWidth: "400px",
                  background: "rgba(30,30,30,0.7)",
                  border: "2px solid #eee",
                  color: "#8FA1A3",
                  fontSize: "1.1rem",
                  minHeight: "120px",
                  borderRadius: "18px",
                  boxShadow: "0 0 6px 1px #fff, 0 0 12px 2px #fff2",
                  backdropFilter: "blur(8px)",
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
            {/* Full Blog Text Box as Dropdown */}
            <div style={{ width: "100%", maxWidth: 800, marginTop: 16 }}>
              <button
                onClick={() => setShowFullBlog((prev) => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-t-lg font-semibold text-lg focus:outline-none"
                style={{
                  background: "rgba(30,30,30,0.7)",
                  color: "#fff",
                  border: showFullBlog ? "2px solid #eee" : "2px solid #8FA1A3",
                  borderBottom: showFullBlog ? "none" : undefined,
                  boxShadow: showFullBlog
                    ? "0 0 6px 1px #fff, 0 0 12px 2px #fff2"
                    : undefined,
                  backdropFilter: "blur(8px)",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  cursor: "pointer",
                  borderTopLeftRadius: "18px",
                  borderTopRightRadius: "18px",
                  borderBottomLeftRadius: showFullBlog ? 0 : "18px",
                  borderBottomRightRadius: showFullBlog ? 0 : "18px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span style={{ letterSpacing: "0.04em", color: "#8A9B9D" }}>
                  Full Blog Text
                </span>
                <span
                  style={{ fontSize: "1.5em", transition: "transform 0.3s" }}
                >
                  {showFullBlog ? "▲" : "▼"}
                </span>
                {showFullBlog && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      background:
                        "linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.25) 80%, transparent 100%)",
                      animation: "shine 2s linear forwards",
                    }}
                  />
                )}
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: showFullBlog ? 400 : 0,
                  opacity: showFullBlog ? 1 : 0,
                  background: "rgba(30,30,30,0.7)",
                  border: showFullBlog ? "2px solid #eee" : "none",
                  borderTop: "none",
                  borderBottomLeftRadius: "18px",
                  borderBottomRightRadius: "18px",
                  boxShadow: showFullBlog
                    ? "0 0 6px 1px #fff, 0 0 12px 2px #fff2"
                    : undefined,
                  backdropFilter: "blur(8px)",
                  color: "#fff",
                  padding: showFullBlog ? "24px" : "0 24px",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {mainText ? (
                  <div
                    className="whitespace-pre-line text-base fullblog-scrollbar"
                    style={{
                      color: "#8A9B9D",
                      maxHeight: "340px",
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
          </div>
        )}
      </main>
    </div>
  );
}
