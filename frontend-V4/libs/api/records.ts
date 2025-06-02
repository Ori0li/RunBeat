import { useAuthStore } from "@/src/stores/useAuthStore";
import { BASE_URL } from "./auth";

export const getRecords = async (date: string) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const [mealRes, exerciseRes] = await Promise.all([
    fetch(`${BASE_URL}/records/meal?date=${date}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }),
    fetch(`${BASE_URL}/records/exercise?date=${date}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  ]);

  const [mealJson, exerciseJson] = await Promise.all([
    mealRes.json(),
    exerciseRes.json(),
  ]);

  if (!mealRes.ok || !mealJson.success) {
    throw new Error(mealJson.message || "식단 기록을 가져오는데 실패했습니다.");
  }

  if (!exerciseRes.ok || !exerciseJson.success) {
    throw new Error(
      exerciseJson.message || "운동 기록을 가져오는데 실패했습니다.",
    );
  }

  const mealRecords = mealJson.data.records.map((record: any) => ({
    id: record.id,
    tag: "식단" as const,
    date: record.date,
    content: record.memo,
    image: record.photoUrl,
  }));

  const exerciseRecords = exerciseJson.data.records.map((record: any) => ({
    id: record.id,
    tag: "운동" as const,
    date: record.date,
    content: record.memo,
    image: record.photoUrl,
  }));

  return [...mealRecords, ...exerciseRecords];
};

export const createRecord = async (recordData: {
  date: string;
  content: string;
  tag: "식단" | "운동";
  image?: string;
}) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const endpoint =
    recordData.tag === "식단" ? "/records/meal" : "/records/exercise";

  console.log("기록 생성 데이터:", {
    date: recordData.date,
    memo: recordData.content,
    photoUrl: recordData.image,
  });

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      date: recordData.date,
      memo: recordData.content,
      photoUrl: recordData.image,
    }),
  });

  const json = await res.json();
  console.log("서버 응답:", json);

  if (!res.ok || !json.success) {
    throw new Error(json.message || "기록 생성에 실패했습니다.");
  }

  return json.data;
};

export const deleteRecord = async (recordId: number, tag: "식단" | "운동") => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const endpoint = tag === "식단" ? "/records/meal" : "/records/exercise";

  const res = await fetch(`${BASE_URL}${endpoint}/${recordId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "기록 삭제에 실패했습니다.");
  }

  return json.data;
};

export const uploadRecordImage = async (
  formData: FormData,
  type: "meal" | "exercise",
) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  try {
    formData.append("type", type);

    console.log("이미지 업로드 요청 데이터:", {
      type,
      file: formData.get("file"),
    });

    const res = await fetch(`${BASE_URL}/records/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    console.log("이미지 업로드 응답 상태:", res.status);
    const json = await res.json();
    console.log("이미지 업로드 응답 데이터:", json);

    if (!res.ok || !json.success) {
      throw new Error(json.message || "이미지 업로드에 실패했습니다.");
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
      "서버 응답 형식이 올바르지 않습니다: " + JSON.stringify(json),
    );
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    if (error instanceof Error) {
      if (error.message.includes("Network request failed")) {
        throw new Error(
          "서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.",
        );
      }
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }
    throw error;
  }
};

export async function analyzeMealImage(imageUrl: string): Promise<string> {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }
  const response = await fetch(`${BASE_URL}/records/meal/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ imageUrl }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "분석 실패");
  }

  return result.data;
}
