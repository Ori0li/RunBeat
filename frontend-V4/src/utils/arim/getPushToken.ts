import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function getPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    alert("실제 기기에서만 푸시 알림을 사용할 수 있습니다.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("푸시 알림 권한이 거부되었습니다.");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data; // expoPushToken
}
