import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useRouter, usePathname, Href } from "expo-router";
import { supabase } from "../../services/supabase.service";
import {
  House,
  MessageCircle,
  Compass,
  LogOut,
  Clock,
} from "lucide-react-native";

interface Thread {
  id: string;
  title: string;
}

function CustomSidebar(props: any) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchThreads = async () => {
      const { data } = await supabase
        .from("threads")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (data) setThreads(data as Thread[]);
    };
    fetchThreads();
  }, []);

  /**
   * Static Navigation Item
   */
  const NavItem = ({
    label,
    icon: Icon,
    route,
  }: {
    label: string;
    icon: any;
    route: string;
  }) => {
    const isActive = pathname === route;

    return (
      <Pressable
        onPress={() => router.push(route as any)}
        className={`flex-row items-center p-4 mx-2 rounded-xl ${
          isActive ? "bg-white/10" : "active:bg-white/5"
        }`}
      >
        <Icon color={isActive ? "white" : "#999"} size={22} />
        <Text
          className={`ml-4 font-medium ${
            isActive ? "text-white" : "text-gray-400"
          }`}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: 60, backgroundColor: "#121212" }}>
      {/* 1. Main Navigation */}
      <View className="mb-4">
        <NavItem label="Home" icon={House} route="/(drawer)/(tabs)" />
        <NavItem
          label="New Chat"
          icon={MessageCircle}
          route="/(drawer)/(tabs)/chat"
        />
      </View>

      <View className="h-[1px] bg-white/10 mx-4 my-2" />

      {/* 2. Chat History */}
      <View className="flex-row items-center px-6 py-4">
        <Clock color="#666" size={16} />
        <Text className="text-gray-500 font-bold uppercase text-xs ml-2 tracking-widest">
          Recent History
        </Text>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              // Object syntax avoids the "RelativePathString" TypeScript error
              router.push({
                pathname: "/(drawer)/(tabs)/thread/[id]",
                params: { id: item.id },
              });
            }}
            className="px-6 py-3 active:bg-white/5"
          >
            <Text className="text-gray-300 text-base" numberOfLines={1}>
              {item.title || "Untitled Conversation"}
            </Text>
          </Pressable>
        )}
      />

      {/* 3. Footer Section */}
      <View className="mt-auto mb-8 border-t border-white/5 pt-4">
        <NavItem label="Logout" icon={LogOut} route="/(drawer)/(tabs)/logout" />
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomSidebar {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitle: "EaseDucation",
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "white",
        drawerStyle: { width: "80%" },
        overlayColor: "rgba(0,0,0,0.7)",
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: "App" }} />
    </Drawer>
  );
}
