// ============================================================
// Trang Chat — Dùng chung cho Buyer và Seller
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Send, MessageSquare, Package, ArrowLeft, Smile, Paperclip, Image as ImageIcon, CheckCheck, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { AppBreadcrumb } from './AppBreadcrumb';
import { chatApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { ChatConversation, ChatMessage } from '../../types';
import { toast } from 'sonner';

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// Giả lập online status — random cho demo
const onlineUsers = new Set(['user-001', 'user-004', 'user-005']);

function OnlineIndicator({ userId }: { userId: string }) {
  const isOnline = onlineUsers.has(userId);
  return (
    <span
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`}
      title={isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
    />
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="flex items-end gap-2">
        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="text-[10px] text-muted-foreground">...</span>
        </div>
        <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
          <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function ConversationItem({
  conv,
  isActive,
  currentUserId,
  onClick,
}: {
  conv: ChatConversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  const otherName = currentUserId === conv.buyerId ? conv.sellerName : conv.buyerName;
  const otherId = currentUserId === conv.buyerId ? conv.sellerId : conv.buyerId;
  return (
    <button
      className={`w-full text-left p-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-xs">{getInitials(otherName)}</AvatarFallback>
          </Avatar>
          <OnlineIndicator userId={otherId} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium truncate">{otherName}</span>
            {conv.unreadCount > 0 && (
              <Badge className="h-5 min-w-5 p-0 flex items-center justify-center shrink-0">
                {conv.unreadCount}
              </Badge>
            )}
          </div>
          {conv.productName && (
            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
              <Package className="h-3 w-3 shrink-0" />
              <span className="truncate">{conv.productName}</span>
            </div>
          )}
          <p className="text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
          <span className="text-muted-foreground text-xs">{conv.lastMessageAt}</span>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg, isOwn, isLast }: { msg: ChatMessage; isOwn: boolean; isLast: boolean }) {
  const isImage = msg.content.startsWith('[IMG:') && msg.content.endsWith(']');
  const imageUrl = isImage ? msg.content.slice(5, -1) : '';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
      {/* Avatar bên trái cho tin nhận */}
      {!isOwn && (
        <div className="mr-2 shrink-0 self-end">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px]">{msg.senderName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <p className="text-muted-foreground text-[11px] mb-1 ml-1">{msg.senderName}</p>
        )}
        {isImage ? (
          <div className={`rounded-2xl overflow-hidden ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
            <div className="bg-muted w-56 h-40 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-muted-foreground text-xs ml-2">Hình ảnh</span>
            </div>
          </div>
        ) : (
          <div
            className={`px-4 py-2.5 relative ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                : 'bg-muted rounded-2xl rounded-bl-sm'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
        )}
        <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-[11px] text-muted-foreground">
            {msg.createdAt}
          </span>
          {isOwn && (
            <CheckCheck className={`h-3.5 w-3.5 ${isLast ? 'text-blue-500' : 'text-muted-foreground/60'}`} />
          )}
        </div>
      </div>

      {/* Avatar bên phải cho tin gửi */}
      {isOwn && (
        <div className="ml-2 shrink-0 self-end">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px]">{msg.senderName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}

// Emoji picker mock
const EMOJI_LIST = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🤔', '😭', '😱', '👏', '🙏', '💯', '✅', '⭐', '💪', '🤝', '📦', '💰', '🏷️'];

function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full right-0 mb-2 bg-popover border rounded-xl shadow-lg p-3 w-64 z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Biểu cảm</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {EMOJI_LIST.map(emoji => (
          <button
            key={emoji}
            className="h-9 w-9 flex items-center justify-center text-xl hover:bg-muted rounded-lg transition-colors"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ChatPageProps {
  breadcrumbPrefix: { label: string; href: string };
}

export function ChatPage({ breadcrumbPrefix }: ChatPageProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(searchParams.get('conv'));
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = user?.id ?? '';
  const userName = user?.fullName ?? '';

  // Lấy danh sách cuộc trò chuyện
  useEffect(() => {
    if (!userId) return;
    chatApi.getConversations(userId).then(setConversations);
  }, [userId]);

  // Lấy tin nhắn khi chọn conversation
  const loadMessages = useCallback(async (convId: string) => {
    const msgs = await chatApi.getMessages(convId);
    setMessages(msgs);
    await chatApi.markConversationRead(convId);
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c),
    );
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId, loadMessages]);

  // Scroll to bottom khi có tin mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConv = (convId: string) => {
    setActiveConvId(convId);
    setSearchParams({ conv: convId });
    setShowSidebar(false); // mobile: ẩn sidebar
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConvId || !userId) return;
    setSending(true);
    try {
      const msg = await chatApi.sendMessage(activeConvId, userId, userName, input.trim());
      setMessages(prev => [...prev, msg]);
      setConversations(prev =>
        prev.map(c => c.id === activeConvId ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt } : c),
      );
      setInput('');

      // Giả lập NCC đang gõ rồi trả lời
      setIsOtherTyping(true);
      const reply = await chatApi.simulateReply(activeConvId);
      setIsOtherTyping(false);
      if (reply) {
        setMessages(prev => [...prev, reply]);
        setConversations(prev =>
          prev.map(c => c.id === activeConvId ? { ...c, lastMessage: reply.content, lastMessageAt: reply.createdAt } : c),
        );
      }
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherName = activeConv
    ? userId === activeConv.buyerId ? activeConv.sellerName : activeConv.buyerName
    : '';
  const otherId = activeConv
    ? userId === activeConv.buyerId ? activeConv.sellerId : activeConv.buyerId
    : '';

  if (!user) {
    return (
      <div className="text-center py-16">
        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Vui lòng đăng nhập để sử dụng tính năng chat</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[breadcrumbPrefix, { label: 'Tin nhắn' }]} />

      <Card className="overflow-hidden">
        <div className="flex h-[calc(100vh-220px)] min-h-[500px]">
          {/* Sidebar — danh sách cuộc trò chuyện */}
          <div className={`w-full md:w-80 border-r flex flex-col shrink-0 ${!showSidebar && activeConvId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b">
              <h3 className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Tin nhắn ({conversations.length})
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Chưa có cuộc trò chuyện nào</p>
                ) : (
                  conversations.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConvId}
                      currentUserId={userId}
                      onClick={() => handleSelectConv(conv.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Nội dung chat */}
          <div className={`flex-1 flex flex-col min-w-0 ${showSidebar && !activeConvId ? 'hidden md:flex' : activeConvId ? 'flex' : 'hidden md:flex'}`}>
            {activeConv ? (
              <>
                {/* Header */}
                <div className="p-3 border-b flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="md:hidden shrink-0" onClick={() => { setShowSidebar(true); setActiveConvId(null); }}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getInitials(otherName)}</AvatarFallback>
                    </Avatar>
                    <OnlineIndicator userId={otherId} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{otherName}</p>
                    {isOtherTyping ? (
                      <p className="text-green-600 text-xs">Đang nhập...</p>
                    ) : activeConv.productName ? (
                      <p className="text-muted-foreground text-xs truncate flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {activeConv.productName}
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        {onlineUsers.has(otherId) ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tin nhắn */}
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mb-2 opacity-40" />
                      <p>Hãy bắt đầu cuộc trò chuyện</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isOwn={msg.senderId === userId}
                        isLast={idx === messages.length - 1 && msg.senderId === userId}
                      />
                    ))
                  )}
                  {isOtherTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Input gửi tin */}
                <Separator />
                <div className="p-3 flex items-center gap-2 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground hover:text-primary"
                    title="Đính kèm hình ảnh"
                    onClick={() => {
                      toast.info('Chức năng đính kèm hình ảnh (giả lập)');
                    }}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground hover:text-primary"
                    title="Đính kèm tệp"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    disabled={sending}
                    className="rounded-full bg-muted/50"
                  />
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`shrink-0 transition-colors ${showEmojiPicker ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                      title="Biểu cảm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    {showEmojiPicker && (
                      <EmojiPicker
                        onSelect={(emoji) => {
                          setInput(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={sending || !input.trim()}
                    size="sm"
                    className="rounded-full h-9 w-9 p-0 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}