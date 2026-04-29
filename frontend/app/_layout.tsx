import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";
import "./global.css";

import { NAV_THEME } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/services/supabase.service";

export const unstable_settings = {
  initialRouteName: "(auth)/login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Initial Session Retrieval
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleNavigation(session);
      setIsReady(true);
    });

    // 2. Listen for Auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleNavigation(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Centralized navigation logic
  const handleNavigation = (session: any) => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      // Redirect to login if no session and not already in auth group
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      // Redirect to app if session exists and user is in auth group
      router.replace("/(tabs)/chat");
    }
  };

  if (!isReady) {
    // Optional: Render a splash screen or null while checking session
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
      <PortalHost />
    </ThemeProvider>
  );
}
