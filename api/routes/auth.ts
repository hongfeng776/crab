import { Router } from 'express';
import { mockUsers } from '../data/mockData.js';

const router = Router();

router.post('/login', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: '请输入手机号和验证码' });
  }
  if (code !== '123456') {
    return res.status(400).json({ success: false, message: '验证码错误(测试码:123456)' });
  }
  
  const currentUser = {
    id: 'current-user',
    nickname: '我是小可爱',
    avatar: mockUsers[0].avatar,
    age: 23,
    gender: 'female',
    distance: 0,
    isOnline: true,
    isVerified: false,
    isHost: false,
    tags: ['音乐', '电影', '美食'],
    signature: '认真生活，慢慢相遇',
    lastActive: new Date().toISOString(),
    location: { lat: 39.9042, lng: 116.4074 },
  };
  
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: currentUser,
    },
  });
});

router.post('/face-login', (_req, res) => {
  const currentUser = {
    id: 'current-user',
    nickname: '我是小可爱',
    avatar: mockUsers[0].avatar,
    age: 23,
    gender: 'female',
    distance: 0,
    isOnline: true,
    isVerified: true,
    isHost: false,
    tags: ['音乐', '电影', '美食'],
    signature: '认真生活，慢慢相遇',
    lastActive: new Date().toISOString(),
    location: { lat: 39.9042, lng: 116.4074 },
    faceScore: 88,
  };
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: currentUser,
    },
  });
});

export default router;
