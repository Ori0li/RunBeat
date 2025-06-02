import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

type ProfileProps = {
  width?: number;
  height?: number;
  uri?: string | null;
};

const Profile: React.FC<ProfileProps> = ({ width = 50, height = 50, uri }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false); // uri가 바뀌면 다시 false
  }, [uri]);

  if (!uri) {
    return (
      <View
        style={[styles.profile, { width, height, backgroundColor: "#ddd" }]}
      />
    );
  }

  return (
    <View style={[styles.profile, { width, height }]}>
      {!isLoaded && (
        <ActivityIndicator
          size="small"
          color="#666"
          style={{
            position: "absolute",
            alignSelf: "center",
            top: height / 2 - 10,
          }}
        />
      )}
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        onLoadEnd={() => setIsLoaded(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderColor: "#efefef",
    borderWidth: 1,
  },
});

export default Profile;
