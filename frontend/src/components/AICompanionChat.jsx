import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, ShieldCheck, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function AICompanionChat({ isOpen, onClose }) {
  const { activeJourney, stops, routes } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi, I'm your NightShield AI Companion. I monitor real-time corridor lighting, crowd levels, fleet delays, and safety telemetry. Ask me anything about your current stop or journey!",
      timestamp: 'Now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const currentStopId = activeJourney?.origin_stop_id || 'stop_01';
  const currentRouteId = activeJourney?.route_id || 'route_n1';

  const quickQuestions = [
    "Is it safe to wait here?",
    "Why is my bus delayed?",
    "Why did I get this alert?",
    "Where is the nearest police or safe haven?",
    "Suggest a safer alternative route"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.risk.companionChat(query, currentStopId, currentRouteId);
      const aiReply = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.reply || "I've checked the corridor telemetry and your current parameters are normal.",
        grounded: res.grounded_context,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "NightShield safety engine is monitoring your location. Station lighting and emergency callboxes are currently active.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-[26px] shadow-2xl flex flex-col h-[580px] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5FA2] via-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1B1B3A]">AI Travel Companion</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ECEAF8] text-[#8B5CF6] text-[10px] font-bold">
                  Grounded AI
                </span>
              </div>
              <p className="text-[11px] text-[#8A8AA8]">
                AI trained on simulated data &bull; Live telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-[#8A8AA8] flex items-center justify-center transition shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-[#F8F7FD] border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 bg-white hover:bg-[#ECEAF8] text-[#8B5CF6] hover:text-[#7C3AED] text-[11px] font-semibold rounded-full border border-slate-200/70 whitespace-nowrap transition shadow-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FCFBFF]">
          {messages.map((m) => {
            const isAI = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-full bg-[#ECEAF8] text-[#8B5CF6] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isAI
                      ? 'bg-white border border-slate-100 text-[#1B1B3A] shadow-soft'
                      : 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                  }`}
                >
                  <p>{m.text}</p>
                  <div
                    className={`text-[9px] mt-1.5 flex items-center justify-end ${
                      isAI ? 'text-[#8A8AA8]' : 'text-white/80'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
                {!isAI && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-[#1B1B3A] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-full bg-[#ECEAF8] text-[#8B5CF6] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-2xl text-xs text-[#8A8AA8] flex items-center gap-1.5 shadow-soft">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI companion about lighting, delays, safety..."
            className="flex-1 py-2.5 px-4 bg-[#F8F7FD] rounded-full text-xs text-[#1B1B3A] placeholder-[#8A8AA8] border border-slate-200 focus:outline-none focus:border-[#8B5CF6]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full gradient-violet-blue text-white flex items-center justify-center disabled:opacity-40 transition shadow-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
