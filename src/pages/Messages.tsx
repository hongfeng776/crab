import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Send,
  Image,
  Smile,
  Bell,
  UserPlus,
  ChevronRight,
  PhoneCall,
  VideoIcon,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Conversation, ChatMessage } from '../../shared/types';
import { mockChatMessages } from '@/lib/mockData';

export default function Messages() {
  const navigate = useNavigate();
  const conversations = useAppStore((s) => s.conversations);
  const setConversations = useAppStore((s) => s.setConversations);
  const markConversationRead = useAppStore((s) => s.markConversationRead);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch('/api/messages/conversations');
        const data = await res.json();
        if (data.success) {
          setConversations(data.data);
          if (data.data.length > 0) {
            setActiveConversation(data.data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadConversations();
  }, [setConversations]);

  useEffect(() => {
    if (activeConversation) {
      const msgs = mockChatMessages[activeConversation] || mockChatMessages['conv-1'] || [];
      setMessages(msgs);
      markConversationRead(activeConversation);
    }
  }, [activeConversation, markConversationRead]);

  const activeConv = conversations.find((c) => c.id === activeConversation);

  const sendMessage = () => {
    if (!inputText.trim() || !currentUser || !activeConv) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: activeConv.partnerId,
      content: inputText.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="h-[calc(100vh-8rem)] glass-strong rounded-3xl overflow-hidden flex">
      <div className="w-80 border-r border-surface-border flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-surface-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">消息</h2>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl glass-light flex items-center justify-center text-white/70 hover:text-white hover:bg-surface-hover transition-colors">
                <UserPlus className="w-5 h-5" />
              </button>
              <button className="w-9 h-9 rounded-xl glass-light flex items-center justify-center text-white/70 hover:text-white hover:bg-surface-hover transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="搜索消息"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface border border-surface-border text-sm placeholder:text-white/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv, index) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-surface-border/50 ${
                activeConversation === conv.id
                  ? 'bg-gradient-to-r from-brand-purple/20 to-transparent'
                  : 'hover:bg-surface-hover'
              }`}
              style={{ animation: `fadeIn 0.3s ease ${index * 0.05}s both` }}
            >
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateX(-10px); }
                  to { opacity: 1; transform: translateX(0); }
                }
              `}</style>
              <div className="relative flex-shrink-0">
                <img
                  src={conv.partnerInfo.avatar}
                  alt={conv.partnerInfo.nickname}
                  className={`w-12 h-12 rounded-full object-cover ${
                    conv.partnerInfo.isVerified ? 'verified-ring' : ''
                  }`}
                />
                {conv.partnerInfo.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1A1D2E]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white truncate">{conv.partnerInfo.nickname}</span>
                  <span className="text-xs text-white/40 flex-shrink-0">{formatTime(conv.lastMessageTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50 truncate">{conv.lastMessage}</span>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 w-5 h-5 rounded-full bg-brand-pink text-xs font-bold text-white flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            <div className="h-16 px-6 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeConv.partnerInfo.avatar}
                  alt={activeConv.partnerInfo.nickname}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{activeConv.partnerInfo.nickname}</span>
                    {activeConv.partnerInfo.isOnline && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        在线
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">{activeConv.partnerInfo.tags.join(' · ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/call/${activeConv.partnerId}`)}
                  className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-white/70 hover:text-green-400 hover:bg-green-400/10 transition-colors"
                >
                  <PhoneCall className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate(`/call/${activeConv.partnerId}`)}
                  className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-white/70 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors"
                >
                  <VideoIcon className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-white/70 hover:text-white hover:bg-surface-hover transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent via-brand-purple/5 to-transparent">
              {messages.map((msg, index) => {
                const isMe = msg.senderId === (currentUser?.id || 'current');
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    style={{ animation: `msgIn 0.3s ease ${index * 0.05}s both` }}
                  >
                    <style>{`
                      @keyframes msgIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                    `}</style>
                    {!isMe && (
                      <img
                        src={activeConv.partnerInfo.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? 'gradient-bg text-white rounded-br-md'
                          : 'glass-light text-white rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-white/70' : 'text-white/40'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-surface-border">
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-white/60 hover:text-white">
                  <Image className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-white/60 hover:text-white">
                  <Smile className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="输入消息..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="w-full h-11 px-4 pr-12 rounded-xl bg-surface border border-surface-border text-sm placeholder:text-white/40 focus:border-brand-purple/50 transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40">
            <div className="w-20 h-20 rounded-full glass-light flex items-center justify-center mb-4">
              <Phone className="w-10 h-10" />
            </div>
            <p>选择一个会话开始聊天</p>
          </div>
        )}
      </div>
    </div>
  );
}
