import { Server } from "socket.io";
import services from "../services";
import Constants from "../config/constants";

let io: Server | null = null;
const EVENTS = Constants.EVENTS;
export function initSocket(server: any) {
  if (io) return io;

  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    path: "/socket.io",
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || null;
    if (!token) return next();

    try {
      const payload = services.jwtService.verifyTokenAndGetPayload(token);
      if (!payload.valid) return next(new Error(payload.error));
      socket.data.userId = payload.data.user.userId;
      return next();
    } catch {
      return next(new Error("auth required"));
    }
  });

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    // if (socket.data.userId) {
    //   socket.join(String(socket.data.userId));
    // }

    socket.on(EVENTS.joinRoom, (room) => {

      const newRoomId = String(room);

      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          socket.leave(roomId);
          console.log(`left room: ${roomId}`);
        }
      }
      socket.join(newRoomId);
      console.log(`joined room: ${newRoomId}`);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected", socket.id);
    });
  });

  return io;
}

export function emitToRoom(roomId: string, event: string, payload: any) {
  if (!io) throw new Error("Socket not initialized");
  io.to(String(roomId)).emit(event, payload);
}
