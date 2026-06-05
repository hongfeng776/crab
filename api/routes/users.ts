import { Router } from 'express';
import { mockUsers } from '../data/mockData.js';
import type { User } from '../../shared/types.js';

const router = Router();

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.get('/', (_req, res) => {
  const { radius = 10, lat, lng } = _req.query;
  const radiusNum = Number(radius);
  const centerLat = lat !== undefined ? Number(lat) : undefined;
  const centerLng = lng !== undefined ? Number(lng) : undefined;

  let processed = mockUsers as Array<User & { distance: number }>;

  if (centerLat !== undefined && centerLng !== undefined && !isNaN(centerLat) && !isNaN(centerLng)) {
    processed = mockUsers.map((u) => {
      const dist = haversineDistance(centerLat, centerLng, u.location.lat, u.location.lng);
      return { ...u, distance: Math.round(dist * 100) / 100 };
    });
  }

  const filtered = processed.filter((u) => u.distance <= radiusNum);
  res.json({
    success: true,
    data: filtered.sort((a, b) => a.distance - b.distance),
  });
});

router.get('/:id', (req, res) => {
  const user = mockUsers.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  res.json({ success: true, data: user });
});

router.post('/:id/greet', (req, res) => {
  const user = mockUsers.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  res.json({
    success: true,
    message: `已向 ${user.nickname} 发送打招呼消息`,
  });
});

export default router;
