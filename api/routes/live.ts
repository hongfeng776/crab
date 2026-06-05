import { Router } from 'express';
import { mockLiveRooms } from '../data/mockData.js';
import type { LiveRoom } from '../../shared/types.js';

const router = Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  let rooms = [...mockLiveRooms];
  if (category && category !== '推荐') {
    rooms = rooms.filter(r => r.category === category);
  }
  rooms = rooms.sort((a, b) => b.viewerCount - a.viewerCount);
  res.json({ success: true, data: rooms });
});

router.get('/:id', (req, res) => {
  const room = mockLiveRooms.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: '直播间不存在' });
  }
  res.json({ success: true, data: room });
});

router.post('/', (req, res) => {
  const { title, category, hostId, hostName, hostAvatar, cover } = req.body;
  const newRoom: LiveRoom = {
    id: `live-${Date.now()}`,
    title,
    cover: cover || '',
    hostId,
    hostName,
    hostAvatar,
    category: category || '才艺',
    viewerCount: 0,
    likeCount: 0,
    isLive: true,
    createdAt: new Date().toISOString(),
  };
  mockLiveRooms.unshift(newRoom);
  res.json({ success: true, data: newRoom });
});

router.post('/:id/close', (req, res) => {
  const roomIndex = mockLiveRooms.findIndex(r => r.id === req.params.id);
  if (roomIndex === -1) {
    return res.status(404).json({ success: false, message: '直播间不存在' });
  }
  mockLiveRooms[roomIndex] = { ...mockLiveRooms[roomIndex], isLive: false };
  res.json({ success: true, message: '直播间已关闭' });
});

export default router;
