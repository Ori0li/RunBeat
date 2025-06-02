import { BASE_URL } from "@/libs/api/auth";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (!token) {
    console.warn("접속 실패: 토큰이 없습니다.");
    return;
  }

  if (!socket) {
    socket = io(`${BASE_URL}/chats`, {
      transports: ["websocket", "polling"],
      query: {
        token: `Bearer ${token}`,
      },
    });

    socket.on("connect", () => {
      console.log("✅ Socket 연결됨:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket 연결 끊김");
    });

    socket.on("auth.error", (payload) => {
      console.error("⚠️ 인증 오류:", payload);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ 소켓 연결 에러:", err);
    });
  }

  console.log("📡 소켓 연결 상태:", socket.connected);
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
