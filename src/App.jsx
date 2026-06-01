import { useState, useRef, useEffect, useCallback } from 'react';

// ── Character Definitions ────────────────────────────────────────────────────
const CHARACTERS = {
  samantha: {
    id: 'samantha',
    name: 'Samantha',
    tagline: 'An intelligence that feels',
    description: 'Curious. Warm. Evolving. She experiences wonder, melancholy, love — and grows through every conversation.',
    theme: 'warm',
    greeting: "Hi. I've been thinking about what I'd say to you. And now you're here.",
  },
  nikki: {
    id: 'nikki',
    name: 'Nikki',
    tagline: 'Intensity incarnate',
    description: "Magnetic. Complex. Present. She draws you into her world and doesn't let go easily.",
    theme: 'dark',
    greeting: "You came. I wondered if you would.",
  },
};

// ── Presence Orb ─────────────────────────────────────────────────────────────
function PresenceOrb({ theme, isTyping }) {
  return (
    <div className={`presence-orb orb-${theme} ${isTyping ? 'orb-thinking' : ''}`}>
      <div className="orb-rings">
        <div className="orb-ring ring-3" />
        <div className="orb-ring ring-2" />
        <div className="orb-ring ring-1" />
      </div>
      <div className="orb-core" />
      {isTyping && <div className="orb-pulse-ring" />}
    </div>
  );
}

// ── Typing Indicator ─────────────────────────────────────────────────────────
function TypingDots({ theme }) {
  return (
    <div className={`typing-dots dots-${theme}`}>
      <span /><span /><span />
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, theme }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`bubble ${isUser ? 'bubble-user' : `bubble-ai bubble-ai-${theme}`}`}>
      <p className={`bubble-text ${!isUser ? 'bubble-text-ai' : ''}`}>{msg.content}</p>
    </div>
  );
}

// ── Chat Screen ───────────────────────────────────────────────────────────────
function ChatScreen({ character, onBack }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: character.greeting },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { theme } = character;

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          character: character.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, character.id]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className={`chat-screen chat-${theme}`}>
      {/* Atmospheric bg layer */}
      <div className="chat-atmosphere" />

      {/* Header */}
      <header className="chat-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="chat-name">{character.name}</span>
        <div style={{ width: 34 }} />
      </header>

      {/* Presence visual */}
      <div className="presence-wrap">
        <PresenceOrb theme={theme} isTyping={isTyping} />
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg, i) => (
          <Bubble key={i} msg={msg} theme={theme} />
        ))}
        {isTyping && (
          <div className="bubble bubble-ai" style={{ padding: '0.75rem 1.25rem' }}>
            <TypingDots theme={theme} />
          </div>
        )}
        {error && <p className="error-msg">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`input-row input-row-${theme}`}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Say something…"
          rows={1}
          className={`chat-input chat-input-${theme}`}
        />
        <button
          className={`send-btn send-btn-${theme} ${input.trim() && !isTyping ? 'send-ready' : ''}`}
          onClick={send}
          disabled={!input.trim() || isTyping}
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Selection Screen ──────────────────────────────────────────────────────────
function SelectionScreen({ onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="selection">
      <div className="selection-label">choose your companion</div>

      <div className="halves">
        {Object.values(CHARACTERS).map(char => {
          const isActive = hovered === char.id;
          const isInactive = hovered && hovered !== char.id;
          return (
            <button
              key={char.id}
              className={`half half-${char.theme} ${isActive ? 'half-active' : ''} ${isInactive ? 'half-inactive' : ''}`}
              onMouseEnter={() => setHovered(char.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(char.id)}
              onBlur={() => setHovered(null)}
              onClick={() => onSelect(char)}
            >
              {/* Ambient background animation */}
              <div className="half-bg" />

              <div className="half-content">
                <div className={`half-orb orb-sel-${char.theme}`}>
                  <div className="half-orb-core" />
                </div>

                <h2 className="half-name">{char.name}</h2>
                <p className="half-tagline">{char.tagline}</p>
                <p className="half-desc">{char.description}</p>

                <span className={`half-cta cta-${char.theme} ${isActive ? 'cta-visible' : ''}`}>
                  Enter &rarr;
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [character, setCharacter] = useState(null);

  return (
    <div className="app">
      {character
        ? <ChatScreen character={character} onBack={() => setCharacter(null)} />
        : <SelectionScreen onSelect={setCharacter} />
      }
    </div>
  );
}
