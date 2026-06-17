// ============================================================
// AI Chatbot Widget — CELLPHONES Floating Advisor
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { MessageCircle, X, Send, Bot, Minimize2, Maximize2, ShoppingCart } from 'lucide-react';
import { chatbotApi, productApi } from '../../services/api';
import type { Product } from '../../types';
import { productDetailPath } from '../../utils/productLinks';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  products?: Product[];
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  '📱 Điện thoại gaming tốt nhất?',
  '📸 Máy chụp ảnh đẹp nhất?',
  '🔋 Pin trâu dưới 15 triệu?',
  '💰 Máy tầm trung tốt nhất?',
  '🔄 Tôi cần thu cũ đổi mới',
];

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Xin chào! 👋 Tôi là **CellBot** — trợ lý AI của CELLPHONES.\n\nTôi có thể giúp bạn **tư vấn chọn điện thoại**, so sánh sản phẩm, tìm combo ưu đãi và nhiều hơn nữa!\n\nBạn cần tư vấn gì hôm nay?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [open, messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatbotApi.sendMessage(text);
      let relatedProducts: Product[] = [];
      if (res.products?.length) {
        const fetched = await Promise.all(res.products.map(id => productApi.getById(id)));
        relatedProducts = fetched.filter(Boolean) as Product[];
      }
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: res.reply,
        products: relatedProducts,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      if (!open) setUnread(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại! 😅',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chatbot-fab"
          aria-label="Mở chat tư vấn"
        >
          <MessageCircle className="chatbot-fab-icon" />
          {unread > 0 && (
            <span className="chatbot-unread">{unread}</span>
          )}
          <span className="chatbot-fab-label">Tư vấn AI</span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className={`chatbot-window ${minimized ? 'chatbot-minimized' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot className="h-5 w-5 text-white" />
                <span className="chatbot-online-dot" />
              </div>
              <div>
                <p className="chatbot-name">CellBot AI</p>
                <p className="chatbot-status">● Đang hoạt động</p>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                onClick={() => setMinimized(v => !v)}
                className="chatbot-icon-btn"
                title={minimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button onClick={() => setOpen(false)} className="chatbot-icon-btn" title="Đóng">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!minimized && (
            <>
              <div className="chatbot-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`chatbot-msg-row ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}>
                    {msg.role === 'bot' && (
                      <div className="chatbot-bot-avatar">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className={`chatbot-bubble ${msg.role === 'user' ? 'chatbot-bubble-user' : 'chatbot-bubble-bot'}`}>
                      <p
                        className="chatbot-bubble-text"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                      />
                      {/* Product cards */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="chatbot-products">
                          {msg.products.slice(0, 3).map(p => (
                            <Link key={p.id} to={productDetailPath(p)} className="chatbot-product-card" onClick={() => setOpen(false)}>
                              <img src={p.images[0]} alt={p.name} className="chatbot-product-img" />
                              <div className="chatbot-product-info">
                                <p className="chatbot-product-name">{p.name}</p>
                                <p className="chatbot-product-price">{formatPrice(p.price)}</p>
                              </div>
                              <ShoppingCart className="h-3.5 w-3.5 text-primary shrink-0" />
                            </Link>
                          ))}
                        </div>
                      )}
                      <span className="chatbot-time">
                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="chatbot-msg-row chatbot-msg-bot">
                    <div className="chatbot-bot-avatar">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="chatbot-bubble chatbot-bubble-bot chatbot-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick questions */}
              {messages.length <= 1 && !loading && (
                <div className="chatbot-quick">
                  {QUICK_QUESTIONS.map(q => (
                    <button key={q} className="chatbot-quick-btn" onClick={() => sendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="chatbot-input-area">
                <input
                  ref={inputRef}
                  className="chatbot-input"
                  placeholder="Nhập câu hỏi..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  disabled={loading}
                  maxLength={300}
                />
                <button
                  className="chatbot-send-btn"
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  aria-label="Gửi"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
