import React, { useState, useRef, useEffect } from 'react';
import { save, load } from '../../utils/storage';
import toast from 'react-hot-toast';

const HF_ROUTER_API = 'https://router.huggingface.co/v1/chat/completions';
const TOKEN = import.meta.env.VITE_AI_TOKEN;
const MODEL = 'Qwen/Qwen3-1.7B:featherless-ai';
const MAX_MSGS = 30;

export default function Chatbot({ issData, newsData }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => load('chat_messages', []));
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    save('chat_messages', messages.slice(-MAX_MSGS));
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const addMsg = (role, content) => {
    const msg = { role, content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev.slice(-MAX_MSGS + 1), msg]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    
    setInput('');
    addMsg('user', text);
    setTyping(true);

    try {
      // Build context from dashboard data
      const issCtx = issData
        ? `ISS Position: Lat ${issData.position?.lat?.toFixed(4)}, Lon ${issData.position?.lon?.toFixed(4)}. Speed: ${issData.speed} km/h. Location: ${issData.locationName}. Crew: ${issData.people?.number || 0} people (${(issData.people?.people || []).map(p => p.name).join(', ') || 'None'}).`
        : 'ISS data unavailable.';

      const newsCtx = newsData && newsData.length
        ? `News Headlines: ${newsData.slice(0, 5).map((a, i) => `[${i+1}] ${a.title} (${a.source?.name})`).join(' | ')}.`
        : 'News data unavailable.';

      const systemPrompt = `You are a Dashboard AI. You ONLY answer questions using the following data. If the answer is not in the data, say "I don't have that info." Do NOT use external knowledge.
DASHBOARD DATA:
${issCtx}
${newsCtx}`;

      // Build message array for Chat Completions API
      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text }
      ];

      const res = await fetch(HF_ROUTER_API, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${TOKEN}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          model: MODEL,
          messages: chatMessages,
          max_tokens: 300,
          temperature: 0.2
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || `API ${res.status}`);
      }

      const result = await res.json();
      const reply = result.choices?.[0]?.message?.content?.trim();
      addMsg('bot', reply || 'I received an empty response.');
    } catch (err) {
      addMsg('bot', `⚠️ Error: ${err.message}. Please check your HF token and API status.`);
    } finally {
      setTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    save('chat_messages', []);
    toast.success('Chat cleared');
  };

  const quickPrompts = [
    'Where is the ISS?',
    'What is the ISS speed?',
    'Latest news?',
    'Who is in space?',
  ];

  return (
    <>
      <button id="chatbot-fab" className="chatbot-fab" onClick={() => setOpen(o => !o)} title="Open AI Chatbot">
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div className="chatbot-window" id="chatbot-window">
          <div className="chatbot-header">
            <h3>🤖 AI Assistant <span className="live-dot" style={{ marginLeft:6 }} /></h3>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-ghost btn-sm" onClick={clearChat} title="Clear chat">🗑️</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          <div className="chatbot-messages" id="chatbot-messages">
            {messages.length === 0 && (
              <div style={{ textAlign:'center', padding:'20px 10px' }}>
                <p style={{ color:'var(--text2)', fontSize:'0.85rem', marginBottom:12 }}>
                  How can I help you today?
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {quickPrompts.map(q => (
                    <button key={q} className="btn btn-ghost btn-sm" onClick={() => { setInput(q); inputRef.current?.focus(); }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="chat-bubble">{m.content}</div>
                <div className="chat-time">{m.time}</div>
              </div>
            ))}
            {typing && (
              <div className="chat-msg bot">
                <div className="chat-bubble">
                  <div className="typing-indicator">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-input">
            <input
              ref={inputRef}
              id="chatbot-input"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={typing}
            />
            <button id="chatbot-send" className="btn btn-primary btn-sm" onClick={send} disabled={typing || !input.trim()}>
              {typing ? '...' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
