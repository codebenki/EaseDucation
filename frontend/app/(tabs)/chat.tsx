import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { ThemedView } from "@/components/themed-view";
import { Input } from "@/components/ui/input";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  fileName?: string;
};

export default function Chat() {
  const colorScheme = useColorScheme() ?? "light";
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverIp, setServerIp] = useState("localhost");

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
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      fileName: fileName,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const url = "http://" + serverIp + ":8010/chat";
      const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const responseText = await response.text();
      let responseData: {
        answer?: string;
        message?: string;
        detail?: string;
      } | null = null;

      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { answer: responseText };
        }
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.detail ||
            `Request failed with status ${response.status}`,
        );
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseData?.answer ?? "No answer returned from the server.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ThemedView className={`flex-1 ${currentTheme.container}`}>
      <View className={`border-b px-4 pb-3 pt-3 ${currentTheme.border}`}>
        <Text
          className={`mb-2 text-xs uppercase tracking-[1px] opacity-60 ${currentTheme.text}`}
        >
          Server IP
        </Text>
        <Input
          value={serverIp}
          onChangeText={setServerIp}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={Platform.OS === "ios" ? "url" : "default"}
          placeholder="192.168.1.10:8010"
          className={`rounded-2xl px-4 py-3 ${currentTheme.inputBg} ${currentTheme.text}`}
          placeholderTextColor={colorScheme === "dark" ? "#71717a" : "#a1a1aa"}
        />
      </View>

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
