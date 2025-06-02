import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { analyzeMealImage } from "@/libs/api/records";

type Props = {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
};

const AnalysisModal = ({ visible, imageUrl, onClose }: Props) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (visible && imageUrl) {
      (async () => {
        try {
          setLoading(true);
          const result = await analyzeMealImage(imageUrl);
          setResult(result);
        } catch (err) {
          setResult("분석 실패: " + err.message);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [visible, imageUrl]);

  const analyzeImage = async () => {
    try {
      const res = await fetch("https://your-api.com/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      setResult(data.result); // 예: "김치찌개, 밥, 계란말이"
    } catch (e) {
      setResult("분석에 실패했습니다.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={30} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : result ? (
          <Text style={styles.resultText}>{result}</Text>
        ) : (
          <Text style={styles.resultText}>분석 결과가 없습니다.</Text>
        )}
      </View>
    </Modal>
  );
};

export default AnalysisModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  image: {
    width: "100%",
    height: "50%",
    resizeMode: "contain",
    marginBottom: 20,
  },
  resultText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});
