import { useEffect, useRef, useState } from "react";
import HeroHeader from "../components/HeroHeader";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! Ask me about gems or Market locations.\nTry: “available gems”, “Blue Sapphire”, “available locations”.",
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const boxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages, sending]);

  function addBot(payload) {
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: payload.answer || payload.message || "No answer",
        suggestions: payload.suggestions || null,
      },
    ]);
  }

  async function sendMessage(text) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;

    setSending(true);
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");

    try {
      const r = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const contentType = r.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await r.json()
        : { message: await r.text() };

      if (!r.ok) {
        addBot({ answer: `Server error: ${data.error || data.message || r.status}` });
      } else {
        addBot(data);
      }
    } catch (e) {
      addBot({ answer: `Error: cannot reach backend. (${e.message})` });
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function onKeyDown(e) {
    // Enter = send, Shift+Enter = new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function renderSuggestions(suggestions) {
    if (!suggestions) return null;
    const gems = suggestions.gems || [];
    const locations = suggestions.locations || [];
    if (gems.length === 0 && locations.length === 0) return null;

    return (
      <div className="sugg-block">
        {gems.length > 0 && (
          <>
            <div className="sugg-title">Suggested gems</div>
            <div className="sugg-grid">
              {gems.map((g) => (
                <button
                  key={`gem-${g.id}`}
                  className="sugg-card"
                  onClick={() => sendMessage(g.name)}
                  disabled={sending}
                >
                  <div className="sugg-img">
                    {g.image_url ? (
                      <img src={`${API}${g.image_url}`} alt={g.name} />
                    ) : (
                      <div className="sugg-img-ph">💎</div>
                    )}
                  </div>
                  <div>
                    <div className="sugg-name">{g.name}</div>
                    <div className="sugg-sub">Tap to ask</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {locations.length > 0 && (
          <>
            <div className="sugg-title" style={{ marginTop: 10 }}>
              Suggested locations
            </div>
            <div className="sugg-chips">
              {locations.map((l) => (
                <button
                  key={`loc-${l.id}`}
                  className="chip"
                  onClick={() => sendMessage(l.name)}
                  disabled={sending}
                >
                  📍 {l.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <HeroHeader
        title="Hii 🤗 Chat with Me... 💬"
        subtitle="Ask questions and get answers 😉💎."
        right={<span className="badge green">For Education</span>}
      />

      <div className="glass-card chat-wrap">
        <div ref={boxRef} className="chat-scroll">
          {messages.map((m, i) => (
            <div key={i} className={`msg-row ${m.role === "user" ? "right" : "left"}`}>
              <div className={`bubble ${m.role === "user" ? "user" : "bot"}`}>
                {m.text}
                {m.role === "assistant" && renderSuggestions(m.suggestions)}
              </div>
            </div>
          ))}

          {sending && (
            <div className="msg-row left">
              <div className="bubble bot typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
        </div>

        <div className="chat-inputbar">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message 🤔"
            disabled={sending}
            rows={2}
          />
          <button className="button" onClick={() => sendMessage()} disabled={sending}>
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}