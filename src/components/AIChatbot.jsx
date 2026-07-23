import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Settings, Key, AlertCircle } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello, I am the Helios Renewables AI PMO Assistant. I have indexed the entire project portfolio, including budgets, WBS milestones, RAID logs, and OCR contract documents. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load API Key from localStorage if available
    const savedKey = localStorage.getItem('helios_api_key') || '';
    setApiKey(savedKey);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('helios_api_key', apiKey);
    setShowSettings(false);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.map(m => ({ id: m.id, role: m.role, content: m.content })),
          apiKey: apiKey || null,
        }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response },
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I encountered an error communicating with the portfolio assistant. Please make sure the backend is active.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "Tell me about Bhadla Solar Park",
    "Which project is most at risk?",
    "How is the project budget broken down?",
    "What are the roles and permissions in Helios?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-950 text-white rounded-full shadow-2xl hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 active:scale-95 group font-medium"
        >
          <div className="relative">
            <MessageSquare className="h-5 w-5 text-teal-400 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
            </span>
          </div>
          <span className="text-xs tracking-wide">AI PMO Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[420px] h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-slate-950 px-4 py-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                <Sparkles className="h-4 w-4 text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Helios Portfolio AI</h3>
                <p className="text-[10px] text-slate-400">
                  {apiKey ? 'Claude 3.5 Sonnet API Connected' : 'Smart AI Consultant Active'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Configure API Key"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Settings Overlay */}
          {showSettings && (
            <form onSubmit={handleSaveKey} className="bg-slate-900 text-white p-4 border-b border-slate-800 flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <Key className="h-4 w-4 text-teal-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-semibold">Anthropic API Key Configuration</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Provide your Claude API Key to query Claude 3.5 Sonnet directly. If left blank, Helios uses its intelligent local PMO database engine.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded text-white focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-500 text-xs font-medium px-3 py-1.5 rounded transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs shadow-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-slate-950 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none font-normal'
                  }`}
                >
                  {/* Process markdown-like formatting in messages */}
                  <div className="whitespace-pre-wrap space-y-1">
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 text-xs shadow-sm flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  <span className="font-medium text-slate-600">Analyzing portfolio database...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Suggested Questions</p>
              <div className="grid grid-cols-2 gap-1.5">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-[11px] text-left text-slate-700 bg-white hover:bg-slate-100 hover:text-teal-700 border border-slate-200/80 rounded-lg px-2.5 py-1.5 transition-all duration-200 shadow-sm font-medium truncate"
                    title={q}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about solar projects, budgets, or roles..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-900 bg-slate-50 focus:bg-white transition-all"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="h-8 w-8 bg-slate-950 text-white rounded-xl flex items-center justify-center hover:bg-teal-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100 transition-all shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
