import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

import { IconSymbol } from "@/src/components/ui/IconSymbol";

export default function TabLayout() {
  // useEffect(() => {
  //   const onBackPress = () => {
  //     return true; // 뒤로가기 이벤트를 무시
  //   };
  //
  //   const subscription = BackHandler.addEventListener(
  //     "hardwareBackPress",
  //     onBackPress
  //   );
  //
  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: "#3c23d7",
            position: "absolute",
          },
          default: {
            backgroundColor: "#3c23d7",
          },
        }),
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#ffffff",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          tabBarLabel: "",
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="note.text" color={color} />
          ),
          tabBarLabel: "",
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="plus.app" color={color} />
          ),
          tabBarLabel: "",
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
          tabBarLabel: "",
        }}
      />
    </Tabs>
  );
}
