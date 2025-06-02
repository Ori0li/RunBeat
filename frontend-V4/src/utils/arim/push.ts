import { useAuthStore } from "@/src/stores/useAuthStore";
import { BASE_URL } from "@/libs/api/auth";

export async function savePushTokenToServer(token: string) {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const res = await fetch(`${BASE_URL}/notifications/token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expoPushToken: token }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "푸시 토큰 저장 실패");
  }

  console.log("✅ 푸시 토큰 저장 완료");
}
