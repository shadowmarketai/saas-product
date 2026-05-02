import { useState, useEffect, useRef } from 'react';

interface ChatFlow {
  id: string;
  trigger: string;
  response: string;
  options?: string[];
}

interface WhatsAppChatbotData {
  business_name?: string;
  whatsapp_number?: string;
  logo_url?: string;
  welcome_message?: string;
  menu_options?: { label: string; response: string }[];
  auto_replies?: { keyword: string; reply: string }[];
  flows?: ChatFlow[];
  business_hours?: string;
  away_message?: string;
  features?: string[];
  theme_primary?: string;
  theme_bg?: string;
  theme_text?: string;
  font_family?: string;
}

interface WhatsAppChatbotRendererProps {
  data: WhatsAppChatbotData;
  preview?: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  options?: string[];
  typing?: boolean;
}

export function WhatsAppChatbotRenderer({ data, preview = false }: WhatsAppChatbotRendererProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showFeatures, setShowFeatures] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const menuOptions = data.menu_options || [];
  const features = data.features || ['24/7 Auto-Reply', 'Smart Menu', 'Lead Collection', 'AI Responses'];

  const addMessage = (text: string, sender: 'bot' | 'user', options?: string[]) => {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { id, text, sender, options }]);
  };

  const addTypingThenMessage = (text: string, options?: string[], delay = 1200) => {
    const typingId = nextId.current++;
    setMessages((prev) => [...prev, { id: typingId, text: '', sender: 'bot', typing: true }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== typingId));
      addMessage(text, 'bot', options);
    }, delay);
  };

  // Initial welcome
  useEffect(() => {
    const welcome = data.welcome_message || `Hello! 👋 Welcome to ${data.business_name || 'our business'}. How can we help you today?`;
    const menuLabels = menuOptions.map((o) => o.label);
    setTimeout(() => addMessage(welcome, 'bot', menuLabels.length > 0 ? menuLabels : undefined), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOptionClick = (option: string) => {
    addMessage(option, 'user');
    const match = menuOptions.find((o) => o.label === option);
    if (match) {
      addTypingThenMessage(match.response, menuOptions.map((o) => o.label));
    } else {
      addTypingThenMessage("Thanks! Is there anything else I can help with?", menuOptions.map((o) => o.label));
    }
  };

  const waNumber = data.whatsapp_number?.replace(/\D/g, '') || '';

  return (
    <div className={`${preview ? 'max-w-sm' : 'max-w-md'} mx-auto min-h-screen flex flex-col`} style={{ backgroundColor: '#ECE5DD', fontFamily: data.font_family || 'Inter, sans-serif' }}>
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
          {data.logo_url ? (
            <img src={data.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-lg font-bold">{(data.business_name || 'B')[0]}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-white font-semibold text-sm">{data.business_name || 'Business'}</h1>
            <svg className="w-4 h-4 text-[#4FC3F7]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <p className="text-[10px] text-green-200">online</p>
        </div>
        <div className="flex gap-4 text-white/70">
          <span className="text-lg">📹</span>
          <span className="text-lg">📞</span>
          <span className="text-lg">⋮</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto min-h-[350px] max-h-[450px]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M20 20h10v10H20zM50 50h10v10H50zM80 20h10v10H80zM110 50h10v10h-10zM140 20h10v10h-10zM170 50h10v10h-10zM20 80h10v10H20zM50 110h10v10H50zM80 80h10v10H80zM110 110h10v10h-10zM140 80h10v10h-10zM170 110h10v10h-10zM20 140h10v10H20zM50 170h10v10H50zM80 140h10v10H80zM110 170h10v10h-10zM140 140h10v10h-10zM170 170h10v10h-10z\'/%3E%3C/g%3E%3C/svg%3E")' }}>
        {/* Date chip */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-white/80 rounded-lg text-[10px] text-gray-500 shadow-sm">
            TODAY
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm text-sm relative ${
                  msg.sender === 'user'
                    ? 'bg-[#DCF8C6] rounded-tr-none'
                    : 'bg-white rounded-tl-none'
                }`}
              >
                {msg.typing ? (
                  <div className="flex gap-1 py-1 px-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <>
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    <p className="text-[9px] text-gray-400 text-right mt-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender === 'user' && ' ✓✓'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Quick Reply Buttons */}
            {msg.options && msg.options.length > 0 && !msg.typing && (
              <div className="flex flex-wrap gap-2 mt-2 ml-2">
                {msg.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className="px-3 py-1.5 bg-white rounded-full text-xs font-medium shadow-sm border border-[#075E54]/20 transition-all hover:bg-[#075E54] hover:text-white active:scale-95"
                    style={{ color: '#075E54' }}
                  >
                    {i + 1}. {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar (decorative) */}
      <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
        <span className="text-xl">😊</span>
        <div className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-gray-400">
          Type a message
        </div>
        <span className="text-xl">🎤</span>
      </div>

      {/* Auto-Reply Rules */}
      {data.auto_replies && data.auto_replies.length > 0 && (
        <div className="bg-white px-4 py-5">
          <h3 className="text-sm font-bold text-[#075E54] mb-3">⚡ Auto-Reply Rules</h3>
          <div className="space-y-2">
            {data.auto_replies.map((ar, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                <span className="px-2 py-0.5 bg-[#075E54] text-white rounded text-[10px] font-bold shrink-0 mt-0.5">
                  {ar.keyword}
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">→ {ar.reply}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-white border-t border-gray-100">
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700"
        >
          <span>🤖 Bot Features</span>
          <span className="text-gray-400">{showFeatures ? '▲' : '▼'}</span>
        </button>
        {showFeatures && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#075E54]/5 rounded-xl p-3">
                <span className="text-[#075E54] text-sm">✓</span>
                <span className="text-xs font-medium">{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Business Hours */}
      {data.business_hours && (
        <div className="bg-white px-4 py-3 border-t border-gray-100 flex items-center gap-2">
          <span className="text-sm">🕐</span>
          <span className="text-xs text-gray-500">{data.business_hours}</span>
        </div>
      )}

      {/* CTA */}
      <div className="bg-white px-4 py-4 border-t border-gray-100">
        <a
          href={waNumber ? `https://wa.me/${waNumber}` : '#'}
          target="_blank"
          rel="noreferrer"
          className="block w-full py-3 rounded-xl text-white font-semibold text-sm text-center transition-transform hover:scale-[1.02] shadow-lg"
          style={{ backgroundColor: '#25D366' }}
        >
          💬 Start Chatting on WhatsApp
        </a>
      </div>

      <div className="text-center py-4 text-xs opacity-30 bg-white">
        Powered by NexaStack
      </div>
    </div>
  );
}

export type { WhatsAppChatbotData, ChatFlow };
