'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { askAgent } from '@/lib/api';
import {
  HiMagnifyingGlass,
  HiArrowPath,
  HiPaperAirplane,
  HiChatBubbleLeftEllipsis,
} from 'react-icons/hi2';

import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm your AI News Assistant. Ask me anything about the latest AI developments — I can search and summarize news for you.\n\nTry: \"What's the latest in AI?\" or \"Tell me about recent LLM breakthroughs\"",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      const res = await askAgent(query);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.data.response },
      ]);
    } catch {
      toast.error('Failed to get response from assistant');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>AI Assistant</h2>
        <p>Ask questions about AI news</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`}
            >
              {m.role === 'assistant' ? (
                <div className="markdown-content">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble assistant">
              <div className="spinner" style={{ width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about AI developments..."
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <HiPaperAirplane />
          </button>
        </div>
      </div>
    </>
  );
}
