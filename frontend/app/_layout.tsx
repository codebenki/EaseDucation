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
import { Session } from "@supabase/supabase-js";

export const unstable_settings = {
  initialRouteName: "(auth)/login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Handle Auth State Updates
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, payload) => {
      setSession(payload);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Handle Navigation Redirection
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      // Not logged in -> force login
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      // Logged in -> move to app
      router.replace("/(tabs)/chat");
    }
  }, [session, isReady, segments]); // Re-run whenever session or location changes

  if (!isReady) return null;

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
