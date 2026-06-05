import { Router } from 'express';
import { mockUsers } from '../data/mockData.js';
import type { User } from '../../shared/types.js';

const router = Router();

router.get('/', (_req, res) => {
  const { radius = 10 } = _req.query;
  const radiusNum = Number(radius);
  const filtered = mockUsers.filter(u => u.distance <= radiusNum);
  res.json({
    success: true,
    data: filtered.sort((a, b) => a.distance - b.distance),
  });
});

router.get('/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  res.json({ success: true, data: user });
});

router.post('/:id/greet', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  res.json({
    success: true,
    message: `已向 ${user.nickname} 发送打招呼消息`,
  });
});

export default router;
