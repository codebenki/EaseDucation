import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getProfileId } from "@/services/supabase.service";
import { sendChatMessage } from "@/services/chat-service"; // Import the service
import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  fileName?: string;
};

interface ChatProps {
  initialMessages?: ChatMessage[];
  threadId?: string;
}

export default function Chat({ initialMessages = [], threadId }: ChatProps) {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serverIp = new URL(url ?? "").hostname;
  const colorScheme = useColorScheme() ?? "light";
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const themeClasses = {
    light: {
      container: "bg-white",
      text: "text-black",
      inputBg: "bg-gray-100",
      border: "border-gray-200",
      previewBg: "bg-gray-50",
    },
    dark: {
      container: "bg-zinc-950",
      text: "text-white",
      inputBg: "bg-zinc-900",
      border: "border-zinc-800",
      previewBg: "bg-zinc-900/50",
    },
  };

  const currentTheme = themeClasses[colorScheme];

  async function handleSendMessage({
    formData,
    message,
    fileName,
  }: {
    formData: FormData;
    message: string;
    fileName?: string;
  }) {
    // 1. UI Update: Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      fileName: fileName,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 2. Call the Service
      const pId = await getProfileId();
      const result = await sendChatMessage({
        serverIp,
        formData,
        profilesId: pId,
        threadId,
      });

      // 3. UI Update: Add AI message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.answer,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // 4. Navigation Logic
      if (threadId == undefined) {
        setMessages([]);
        router.push(`/(drawer)/(tabs)/thread/${result.thread_id}` as any);
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ThemedView className={`flex-1 ${currentTheme.container}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={
          Platform.OS === "ios" ? headerHeight : insets.top
        }
      >
        <MessageList
          messages={messages}
          isLoading={isLoading}
          colorScheme={colorScheme}
          theme={currentTheme}
        />

        <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
          <ChatInput
            theme={currentTheme}
            colorScheme={colorScheme}
            onSend={handleSendMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
