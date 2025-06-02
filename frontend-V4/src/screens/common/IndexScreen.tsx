import { refreshToken } from "@/libs/api/auth";
import { getUserMainProfile } from "@/libs/api/user";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { deleteRefreshToken, getRefreshToken } from "@/src/utils/secureToken";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IndexScreen = () => {
  const router = useRouter();
  const [isTryingAutoLogin, setIsTryingAutoLogin] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const token = await getRefreshToken();
        console.log("token test : ", token);
        if (!token) {
          setIsTryingAutoLogin(false);
          return;
        }

        const { accessToken, accountId, role } = await refreshToken();

        console.log("자동 로그인 성공:", { accessToken, accountId, role });

        // Zustand store에 저장
        setAuth(accessToken, accountId, role);

        if (role === "user") {
          try {
            const userProfile = await getUserMainProfile();
            console.log("프로필 정보:", userProfile);

            if (userProfile.height === null || userProfile.weight === null) {
              router.replace("/profile/(tabs)/profileinfo");
            } else {
              router.replace("/user/(tabs)");
            }
          } catch (error) {
            console.error("프로필 정보 조회 실패:", error);
            router.replace("/user/(tabs)");
          }
        } else if (role === "trainer") {
          router.replace("/trainer/(tabs)");
        } else {
          throw new Error("유효하지 않은 역할입니다.");
        }
      } catch (err) {
        console.error("자동 로그인 실패:", err);
        await deleteRefreshToken();
        setIsTryingAutoLogin(false);
      }
    };

    tryAutoLogin();
  }, []);

  const accessToken = useAuthStore((s) => s.accessToken);
  const accountId = useAuthStore((s) => s.accountId);
  console.log("🧪 자동로그인 상태 확인:", { accessToken, accountId });

  if (isTryingAutoLogin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3C23D7" />
          <Text style={styles.loadingText}>자동 로그인 시도중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.Wrapper}>
          <Image
            style={styles.img}
            source={require("@/assets/images/common/SymbolLogo.png")}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.userLoginButton}
            onPress={() => router.push("/login/(tabs)/login?role=user")}
          >
            <Text style={styles.userLoginText}>회원 로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.trainerLoginButton}
            onPress={() => router.push("/login/(tabs)/login?role=trainer")}
          >
            <Text style={styles.trainerLoginText}>트레이너 로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push("/login/(tabs)/register")}
          >
            <Text style={styles.signupText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IndexScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
  },
  Wrapper: {
    width: "70%",
    margin: "auto",
    top: "50%",
  },
  img: {
    width: "100%",
    objectFit: "contain",
    marginBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  userLoginButton: {
    width: "100%",
    borderRadius: 9999,
    backgroundColor: "#3C23D7",
    padding: 15,
    marginBottom: 20,
  },
  userLoginText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15,
  },
  trainerLoginButton: {
    width: "100%",
    borderRadius: 9999,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3C23D7",
    padding: 15,
    marginBottom: 20,
  },
  trainerLoginText: {
    color: "#3C23D7",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15,
  },
  signupText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#c5c5c5",
    textAlign: "center",
    width: "100%",
  },
  signupButton: {
    padding: 10,
  },
});
