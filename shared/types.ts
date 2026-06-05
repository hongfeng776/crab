export interface User {
  id: string;
  nickname: string;
  avatar: string;
  age: number;
  gender: 'male' | 'female';
  distance: number;
  isOnline: boolean;
  isVerified: boolean;
  isHost: boolean;
  tags: string[];
  signature: string;
  lastActive: string;
  location: { lat: number; lng: number };
  faceScore?: number;
  coins?: number;
}

export interface RechargePackage {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  isHot?: boolean;
  isDiscount?: boolean;
}

export type PaymentMethod = 'wechat' | 'alipay' | 'qq';

export interface LiveRoom {
  id: string;
  title: string;
  cover: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  category: string;
  viewerCount: number;
  likeCount: number;
  isLive: boolean;
  createdAt: string;
}

export interface DanmakuMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: number;
  type: 'text' | 'gift' | 'system';
  gift?: { name: string; icon: string; count: number };
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  value: number;
}

export interface CallSession {
  id: string;
  callerId: string;
  calleeId: string;
  type: 'audio' | 'video';
  status: 'calling' | 'connected' | 'ended' | 'rejected';
  startTime?: string;
  endTime?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;  content: string;
  type: 'text' | 'image' | 'call_record';
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  partnerId: string;
  partnerInfo: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface FaceVerifyResult {
  passed: boolean;
  score: number;
  celebrityMatch?: { name: string; similarity: number };
  verifiedAt: string;
}
