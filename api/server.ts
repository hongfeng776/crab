import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { mockDanmakuList, mockUsers } from './data/mockData.js';

const PORT = process.env.PORT || 3001;

const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});

const roomViewers: Record<string, Set<string>> = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', ({ roomId, userId, userName, userAvatar }) => {
    socket.join(roomId);
    
    if (!roomViewers[roomId]) {
      roomViewers[roomId] = new Set();
    }
    roomViewers[roomId].add(socket.id);
    
    io.to(roomId).emit('viewer_update', {
      roomId,
      viewerCount: roomViewers[roomId].size,
    });

    socket.to(roomId).emit('receive_danmaku', {
      id: `sys-${Date.now()}`,
      userId: 'system',
      userName: '系统',
      userAvatar: '',
      content: `${userName} 进入了直播间`,
      timestamp: Date.now(),
      type: 'system',
    });

    console.log(`User ${userName} joined room ${roomId}`);
  });

  socket.on('leave_room', ({ roomId, userName }) => {
    socket.leave(roomId);
    
    if (roomViewers[roomId]) {
      roomViewers[roomId].delete(socket.id);
      io.to(roomId).emit('viewer_update', {
        roomId,
        viewerCount: roomViewers[roomId].size,
      });
    }

    socket.to(roomId).emit('receive_danmaku', {
      id: `sys-${Date.now()}`,
      userId: 'system',
      userName: '系统',
      userAvatar: '',
      content: `${userName} 离开了直播间`,
      timestamp: Date.now(),
      type: 'system',
    });
  });

  socket.on('send_danmaku', ({ roomId, userId, userName, userAvatar, content }) => {
    const msg = {
      id: `msg-${Date.now()}-${Math.random()}`,
      userId,
      userName,
      userAvatar,
      content,
      timestamp: Date.now(),
      type: 'text' as const,
    };
    io.to(roomId).emit('receive_danmaku', msg);
  });

  socket.on('send_gift', ({ roomId, userId, userName, userAvatar, gift }) => {
    const msg = {
      id: `gift-${Date.now()}`,
      userId,
      userName,
      userAvatar,
      content: `送出了 ${gift.name} x${gift.count}`,
      timestamp: Date.now(),
      type: 'gift' as const,
      gift,
    };
    io.to(roomId).emit('receive_danmaku', msg);
    io.to(roomId).emit('receive_gift', { sender: userName, gift });
  });

  socket.on('like', ({ roomId }) => {
    io.to(roomId).emit('like_update', { roomId });
  });

  socket.on('webrtc_offer', (data) => {
    socket.to(data.to).emit('webrtc_offer', data);
  });

  socket.on('webrtc_answer', (data) => {
    socket.to(data.to).emit('webrtc_answer', data);
  });

  socket.on('webrtc_ice_candidate', (data) => {
    socket.to(data.to).emit('webrtc_ice_candidate', data);
  });

  socket.on('incoming_call', ({ calleeId, callerInfo, callId, type }) => {
    socket.broadcast.emit('incoming_call', {
      callId,
      callerInfo,
      type,
    });
  });

  socket.on('call_accepted', ({ callId }) => {
    socket.broadcast.emit('call_accepted', { callId });
  });

  socket.on('call_rejected', ({ callId }) => {
    socket.broadcast.emit('call_rejected', { callId });
  });

  socket.on('call_ended', ({ callId }) => {
    socket.broadcast.emit('call_ended', { callId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (const roomId of Object.keys(roomViewers)) {
      if (roomViewers[roomId].has(socket.id)) {
        roomViewers[roomId].delete(socket.id);
        io.to(roomId).emit('viewer_update', {
          roomId,
          viewerCount: roomViewers[roomId].size,
        });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`WebSocket ready on ws://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
