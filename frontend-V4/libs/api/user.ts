import { useAuthStore } from "@/src/stores/useAuthStore";
import { BASE_URL } from "./auth";

export const getUserMainProfile = async () => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const res = await fetch(`${BASE_URL}/profile/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "프로필 정보를 가져오는데 실패했습니다.");
  }

  return json.data;
};

export const getUserDetailProfile = async () => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const res = await fetch(`${BASE_URL}/profile/info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "프로필 정보를 가져오는데 실패했습니다.");
  }

  return json.data;
};

export const updateUserProfile = async (profileData: {
  name: string;
  trainer: string;
  height: number;
  weight: number;
  gender: string;
}) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const res = await fetch(`${BASE_URL}/profile/info`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(profileData),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "프로필 수정에 실패했습니다.");
  }

  return json.data;
};

export const uploadProfileImage = async (formData: FormData) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  try {
    console.log("이미지 업로드 중...");
    console.log("업로드할 이미지 데이터:", {
      type: formData.get("type"),
      file: formData.get("file"),
    });

    const res = await fetch(`${BASE_URL}/profile/photo`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    console.log("Response status:", res.status);
    const json = await res.json();
    console.log("Response data:", json);

    if (!res.ok || !json.success) {
      throw new Error(json.message || `서버 오류 (${res.status})`);
    }

    // 서버 응답 구조 확인
    if (json.data) {
      // photoUrl이 data 안에 있는 경우
      if (json.data.photoUrl) {
        return json.data.photoUrl;
      }
      // photoUrl이 data 자체인 경우
      if (typeof json.data === "string") {
        return json.data;
      }
    }

    throw new Error(
      "서버 응답 형식이 올바르지 않습니다: " + JSON.stringify(json)
    );
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    if (error instanceof Error) {
      if (error.message.includes("Network request failed")) {
        throw new Error(
          "서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."
        );
      }
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }
    throw error;
  }
};
