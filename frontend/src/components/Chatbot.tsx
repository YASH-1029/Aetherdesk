"use client"

import { useState, useRef, useEffect } from 'react';

interface Message {
  from: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      from: 'user', 
      text: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ 
          message: userMessage.text,
          sessionId: sessionId
        }),
      });
   
      const data = await res.json();

      if (res.ok) {
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
        }

        setMessages((prev) => [...prev, { 
          from: 'ai', 
          text: data.response,
          timestamp: data.timestamp 
        }]);
      } else {
        const errorMessage = data.error || data.message || `Server error: ${res.status} ${res.statusText}`;
        console.error('API Error:', errorMessage);
        setMessages((prev) => [...prev, { 
          from: 'ai', 
          text: `Error: ${errorMessage}` 
        }]);
      }
    } catch (error) {
      console.error('Network error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
      setMessages((prev) => [...prev, { 
        from: 'ai', 
        text: `Network error: ${errorMessage}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      const res = await fetch('/api/ai/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || errorData.message || `Error: ${res.status} ${res.statusText}`;
        console.error('Clear conversation error:', errorMessage);
        setMessages((prev) => [...prev, { 
          from: 'ai', 
          text: `Error clearing conversation: ${errorMessage}` 
        }]);
        return;
      }
      setMessages([]);
      setSessionId(null);
    } catch (error) {
      console.error('Error clearing conversation:', error);
      setMessages([]);
      setSessionId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Robot Avatar Component
  const RobotAvatar = ({ isThinking = false }) => (
    <div className="relative">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-0.5 ${isThinking ? 'animate-pulse' : ''}`}>
        <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
          {/* Robot face */}
          <div className="relative">
            {/* Eyes */}
            <div className="flex space-x-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-yellow-400 animate-ping' : 'bg-cyan-400'}`}></div>
              <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-yellow-400 animate-ping' : 'bg-cyan-400'}`} style={{animationDelay: '0.2s'}}></div>
            </div>
            {/* Mouth */}
            <div className="w-4 h-1 bg-cyan-400 rounded-full opacity-80"></div>
          </div>
          
          {/* Animated circuit pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1 left-1 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute top-2 right-1 w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // User Avatar Component
  const UserAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
      U
    </div>
  );

  // Floating Bot Button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:rotate-12"
        >
          {/* Pulsing ring */}
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full opacity-30 group-hover:opacity-50 animate-pulse"></div>
          
          {/* Inner content */}
          <div className="relative w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
            <RobotAvatar />
          </div>
          
          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-bounce">
            AI
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="w-96 h-[500px] bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
        {/* Futuristic Header */}
        <div className="relative p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RobotAvatar />
              <div>
                <h3 className="text-white font-bold text-lg">AI Assistant</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-200">Online • Neural Network Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={clearConversation}
                disabled={loading}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-900/50 space-y-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="relative">
                <RobotAvatar />
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-medium">Hello! Its your AI Assistant</h4>
                <p className="text-gray-400 text-sm">Ask me anything about your support tickets or platform features!</p>
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end space-x-3 ${msg.from === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                {msg.from === 'user' ? <UserAvatar /> : <RobotAvatar />}
              </div>
              
              {/* Cloud-like message bubble */}
              <div className={`relative max-w-[70%] ${msg.from === 'user' ? 'ml-auto' : ''}`}>
                <div className={`
                  px-4 py-3 rounded-3xl shadow-lg backdrop-blur-sm border
                  ${msg.from === 'user' 
                    ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white border-orange-400/30 rounded-br-md' 
                    : 'bg-gray-800/80 text-gray-100 border-gray-600/30 rounded-bl-md'
                  }
                `}>
                  <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                  {msg.timestamp && (
                    <div className={`text-xs mt-2 opacity-60 ${
                      msg.from === 'user' ? 'text-right text-orange-100' : 'text-gray-400'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                
                {/* Cloud tail */}
                <div className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                  msg.from === 'user' 
                    ? 'right-0 translate-x-1.5 bg-gradient-to-br from-orange-500 to-pink-500' 
                    : 'left-0 -translate-x-1.5 bg-gray-800/80'
                }`}></div>
              </div>
            </div>
          ))}

          {/* Thinking Animation */}
          {loading && (
            <div className="flex items-end space-x-3">
              <div className="flex-shrink-0">
                <RobotAvatar isThinking={true} />
              </div>
              <div className="relative">
                <div className="bg-gray-800/80 text-gray-100 border border-gray-600/30 px-4 py-3 rounded-3xl rounded-bl-md backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-300">Processing your message...</span>
                  </div>
                </div>
                <div className="absolute top-4 left-0 -translate-x-1.5 w-3 h-3 bg-gray-800/80 transform rotate-45"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Futuristic Input Area */}
        <div className="p-4 bg-white backdrop-blur border-t border-white">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Type your message to the AI..."
                className="w-full bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600/50 rounded-2xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all"
                style={{maxHeight: '100px'}}
              />
              
              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-2 bottom-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 rounded-full flex items-center justify-center transition-all transform hover:scale-110 disabled:scale-100"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center justify-center mt-2 space-x-2 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span>Aether AI • Ready</span>
            </div>
            {sessionId && (
              <span className="opacity-50">• Session: {sessionId.substring(0, 8)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}