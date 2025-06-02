// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/login" />; // 또는 자동 로그인 후 "/user" 등
}
