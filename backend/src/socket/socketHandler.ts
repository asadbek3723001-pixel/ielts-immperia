import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JwtPayload } from '../types';

let io: Server;

const allowedOrigins = (ENV.CLIENT_URL || '')
  .split(',')
  .map(u => u.trim().replace(/^["']|["']$/g, ''))
  .filter(Boolean);

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/[\r\n\t]/g, '').trim();
        const isAllowed = allowedOrigins.length === 0 || allowedOrigins.some(o => o === '*' || o === cleanOrigin);
        if (isAllowed) {
          callback(null, cleanOrigin);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
      (socket as Socket & { user: JwtPayload }).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as Socket & { user: JwtPayload }).user;
    console.log(`[Socket] Connected: ${user.username} (${user.role})`);

    // Admins join admin room for live monitoring
    if (user.role === 'ADMIN') {
      socket.join('admin_room');
      console.log(`[Socket] Admin ${user.username} joined admin_room`);
    }

    // Students join their own room + test room
    if (user.role === 'STUDENT') {
      socket.join(`student_${user.userId}`);

      socket.on('join_test_room', (testSessionId: string) => {
        socket.join(`test_${testSessionId}`);
        console.log(`[Socket] Student ${user.username} joined test room ${testSessionId}`);
      });

      socket.on('heartbeat', (data: { testSessionId: string }) => {
        // Update last active
        io.to('admin_room').emit('student_heartbeat', {
          studentId: user.userId,
          username: user.username,
          testSessionId: data.testSessionId,
          timestamp: new Date(),
        });
      });

      socket.on('security_violation', (data: { testSessionId: string, violationType: string, strikeCount: number, isFatal?: boolean }) => {
        console.warn(`[Socket] Security Violation from ${user.username} (Fatal: ${data.isFatal}): ${data.violationType}`);
        io.to('admin_room').emit('student_violation', {
          studentId: user.userId,
          username: user.username,
          testSessionId: data.testSessionId,
          violationType: data.violationType,
          strikeCount: data.strikeCount,
          isFatal: data.isFatal,
          timestamp: new Date(),
        });
        console.log(`[Socket] Broadcasted student_violation to admin_room`);
      });
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${user.username}`);
      if (user.role === 'STUDENT') {
        io.to('admin_room').emit('student_disconnected', {
          studentId: user.userId,
          username: user.username,
          timestamp: new Date(),
        });
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
