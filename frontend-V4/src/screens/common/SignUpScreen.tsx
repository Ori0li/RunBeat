import { addUser } from "@/libs/api/register";
import ButtonForm from "@/src/components/common/ButtonForm";
import InputForm from "@/src/components/common/InputForm";
import UseContainer from "@/src/components/common/UseContainer";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

const SignUpScreen = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 검사
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[!@#$%^&*]).{4,}$/; // 특수문자 포함 + 4자리 이상
    return passwordRegex.test(password);
  };

  const handleSignUp = async () => {
    try {
      if (!name || !email || !password || !passwordCheck) {
        Alert.alert("알림", "모든 필드를 입력해주세요.");
        return;
      }
      if (!validateEmail(email)) {
        Alert.alert("알림", "이메일 형식이 맞지 않습니다.");
        return;
      }

      if (!validatePassword(password)) {
        Alert.alert(
          "알림",
          "비밀번호는 특수문자를 포함한 4자리 이상이어야 합니다."
        );
        return;
      }

      if (password !== passwordCheck) {
        Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
        return;
      }

      const user = await addUser({
        name: name,
        email: email,
        password: password,
        role: "user",
      });

      Alert.alert("성공", "회원가입이 완료되었습니다.", [
        {
          text: "확인",
          onPress: () => router.push("/login/(tabs)"),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "오류",
        error instanceof Error ? error.message : "회원가입에 실패했습니다."
      );
    }
  };

  return (
    <UseContainer>
      <View style={styles.section}>
        <View>
          <InputForm
            title="*이름"
            placeholder="이름을 입력해주세요"
            value={name}
            setValue={setName}
          />
          <InputForm
            title="*이메일"
            placeholder="이메일을 입력해주세요"
            value={email}
            setValue={setEmail}
          />
          <InputForm
            title="*비밀번호"
            placeholder="특수문자를 포함한 4자리 이상"
            value={password}
            setValue={setPassword}
            isPassword={true}
          />
          <InputForm
            title="*비밀번호 확인"
            placeholder="특수문자를 포함한 4자리 이상"
            value={passwordCheck}
            setValue={setPasswordCheck}
            isPassword={true}
          />
        </View>
        <ButtonForm name="회원가입" onPress={handleSignUp} />
      </View>
    </UseContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },
});

export default SignUpScreen;
