import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="logout" />

      {/* Register the thread route so it inherits the Tab context (keeping state alive) */}
      <Tabs.Screen
        name="thread/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="quiz/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
