import { Router } from 'express';
import { mockUsers } from '../data/mockData.js';

const router = Router();

router.post('/initiate', (req, res) => {
  const { callerId, calleeId, type } = req.body;
  const callee = mockUsers.find(u => u.id === calleeId);
  if (!callee) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  const session = {
    id: `call-${Date.now()}`,
    callerId,
    calleeId,
    type: type || 'video',
    status: 'calling',
    startTime: new Date().toISOString(),
  };
  res.json({ success: true, data: { session, calleeInfo: callee } });
});

router.post('/answer', (req, res) => {
  const { callId, accept } = req.body;
  res.json({
    success: true,
    data: {
      callId,
      status: accept ? 'connected' : 'rejected',
      connectedAt: accept ? new Date().toISOString() : null,
    },
  });
});

router.post('/end', (req, res) => {
  const { callId } = req.body;
  res.json({
    success: true,
    data: {
      callId,
      status: 'ended',
      endTime: new Date().toISOString(),
      duration: Math.floor(Math.random() * 600) + 30,
    },
  });
});

export default router;
