import { Router } from 'express';
import { mockConversations, mockChatMessages } from '../data/mockData.js';

const router = Router();

router.get('/conversations', (_req, res) => {
  res.json({ success: true, data: mockConversations });
});

router.get('/conversations/:id', (req, res) => {
  const messages = mockChatMessages[req.params.id] || mockChatMessages['conv-1'] || [];
  res.json({ success: true, data: messages });
});

router.post('/send', (req, res) => {
  const { senderId, receiverId, content, type = 'text' } = req.body;
  const newMessage = {
    id: `msg-${Date.now()}`,
    senderId,
    receiverId,
    content,
    type,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  res.json({ success: true, data: newMessage });
});

export default router;
