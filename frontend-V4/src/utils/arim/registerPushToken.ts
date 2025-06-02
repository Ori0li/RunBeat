import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function registerPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("푸시 알림은 실제 기기에서만 지원됩니다.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("푸시 알림 권한이 거부되었습니다.");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  console.log("📲 발급된 Expo Push Token:", token);

  return token;
}
