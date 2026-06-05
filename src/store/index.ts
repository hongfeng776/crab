import { create } from 'zustand';
import type { User, LiveRoom, Conversation, CallSession, DanmakuMessage } from '../../shared/types';

interface AppState {
  currentUser: User | null;
  isLoggedIn: boolean;
  nearbyUsers: User[];
  liveRooms: LiveRoom[];
  conversations: Conversation[];
  currentCall: CallSession | null;
  danmakuMessages: DanmakuMessage[];
  
  setCurrentUser: (user: User | null) => void;
  setLoggedIn: (status: boolean) => void;
  setNearbyUsers: (users: User[]) => void;
  setLiveRooms: (rooms: LiveRoom[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentCall: (call: CallSession | null) => void;
  addDanmaku: (msg: DanmakuMessage) => void;
  clearDanmaku: () => void;
  updateViewerCount: (roomId: string, count: number) => void;
  incrementLikeCount: (roomId: string) => void;
  markConversationRead: (conversationId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  isLoggedIn: false,
  nearbyUsers: [],
  liveRooms: [],
  conversations: [],
  currentCall: null,
  danmakuMessages: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  setLoggedIn: (status) => set({ isLoggedIn: status }),
  setNearbyUsers: (users) => set({ nearbyUsers: users }),
  setLiveRooms: (rooms) => set({ liveRooms: rooms }),
  setConversations: (conversations) => set({ conversations }),
  setCurrentCall: (call) => set({ currentCall: call }),
  
  addDanmaku: (msg) => set((state) => ({
    danmakuMessages: [...state.danmakuMessages.slice(-50), msg]
  })),
  
  clearDanmaku: () => set({ danmakuMessages: [] }),
  
  updateViewerCount: (roomId, count) => set((state) => ({
    liveRooms: state.liveRooms.map(r =>
      r.id === roomId ? { ...r, viewerCount: count } : r
    )
  })),
  
  incrementLikeCount: (roomId) => set((state) => ({
    liveRooms: state.liveRooms.map(r =>
      r.id === roomId ? { ...r, likeCount: r.likeCount + 1 } : r
    )
  })),
  
  markConversationRead: (conversationId) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    )
  })),
}));
