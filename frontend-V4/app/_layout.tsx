import { Stack } from "expo-router";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "@/src/utils/socket";
import { useFonts } from "expo-font";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { registerNotificationHandler } from "@/src/utils/arim/registerNotificationHandler";
import { registerPushToken } from "@/src/utils/arim/registerPushToken";
import { savePushTokenToServer } from "@/src/utils/arim/push";

export default function Layout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const accessToken = useAuthStore((s) => s.accessToken);
  const accountId = useAuthStore((s) => s.accountId);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    registerNotificationHandler();
  }, []);

  useEffect(() => {
    if (accessToken && accountId != null) {
      connectSocket(accessToken);

      registerPushToken()
        .then((token) => {
          if (token) return savePushTokenToServer(token);
        })
        .catch((err) => {
          console.error("푸시 토큰 저장 실패:", err);
        });

      return () => disconnectSocket();
    }
  }, [accessToken, accountId]);

  if (!loaded || !hasHydrated) {
    console.log("🟡 앱 준비 중...", { loaded, hasHydrated });
    return null;
  }

  console.log("🟢 렌더링 시작", { accessToken, accountId });

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
