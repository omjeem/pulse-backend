import services from "../services";
import { io } from "..";

io.use((socket, next) => {
  const token =
    (socket.handshake.auth && (socket.handshake.auth as any).token) || null;
  console.log("Hit here ---- ", token);
  if (!token) {
    return next();
  }
  try {
    const payload = services.jwtService.verifyTokenAndGetPayload(token);

    if (!payload.valid) {
      return next(new Error(payload.error));
    }
    const { user } = payload.data;
    socket.data.userId = user.userId;
    return next();
  } catch (err) {
    console.warn("socket auth failed", err);
    return next(new Error("auth required"));
  }
});

io.on("connection", (socket) => {
  console.log("socket connected", "user:", socket.data.userId);
  if (socket.data.userId) socket.join(String(socket.data.userId));

  socket.on("join-room", (roomId: string) => {
    console.log("Room Join Request", roomId);
    socket.emit("error", "You cant join");
    socket.join(roomId);
  });

  socket.on("leave-room", (roomId: string) => {
    socket.leave(roomId);
  });

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected", socket.id, reason);
  });

  socket.on("ping-server", (cb) => cb && cb({ ok: true, id: socket.id }));
});

export function emitToRoom(roomId: string, event: string, payload: any) {
  io.to(String(roomId)).emit(event, payload);
}

export function emitToAll(event: string, payload: any) {
  io.emit(event, payload);
}
