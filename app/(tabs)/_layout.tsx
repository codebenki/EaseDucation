import { Tabs } from "expo-router";
import React, { useState } from "react";
import { Pressable } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import {
  Compass,
  House,
  Menu,
  MessageCircle,
} from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [tabsCollapsed, setTabsCollapsed] = useState(false);
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        headerShown: true,
        headerLeft: () => (
          <Pressable
            onPress={() => setTabsCollapsed((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={
              tabsCollapsed ? "Expand navigation tabs" : "Collapse navigation tabs"
            }
            style={{ marginLeft: 16 }}
          >
            <Menu color={theme.text} size={22} />
          </Pressable>
        ),
        tabBarButton: HapticTab,
        tabBarPosition: "left",
        tabBarShowLabel: !tabsCollapsed,
        tabBarStyle: {
          width: tabsCollapsed ? 72 : 220,
          backgroundColor: theme.card,
          borderRightColor: theme.border,
        },
        tabBarItemStyle: {
          marginHorizontal: 8,
          marginVertical: 4,
          borderRadius: 14,
        },
        tabBarLabelStyle: {
          marginLeft: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
