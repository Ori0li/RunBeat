import { useAuthStore } from "@/src/stores/useAuthStore";
import { BASE_URL } from "@/libs/api/auth";

export async function savePushToken(token: string): Promise<void> {
  const { accessToken } = useAuthStore.getState();

  if (!accessToken) return;

  await fetch(`${BASE_URL}/notifications/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ expoPushToken: token }),
  });
}
