import { useEffect, useState } from "react";
import { Text } from "react-native";

const DebugTime = () => {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      setNow(date.toString()); // 또는 date.toISOString()
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <Text>현재 시각: {now}</Text>;
};

export default DebugTime;
