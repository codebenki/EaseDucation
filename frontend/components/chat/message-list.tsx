import React from "react";
import { ScrollView, Text, View } from "react-native";

import { ChatMessage } from "../../app/(tabs)/chat";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  colorScheme: "light" | "dark";
  theme: {
    text: string;
    inputBg: string;
    previewBg: string;
  };
}

export function MessageList({
  messages,
  isLoading,
  colorScheme,
  theme,
}: MessageListProps) {
  const assistantBubbleBg =
    colorScheme === "dark" ? theme.inputBg : theme.previewBg;
  const assistantMetaText =
    colorScheme === "dark" ? "text-zinc-300" : "text-zinc-500";

  return (
    <ScrollView
      className="flex-1 px-4"
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      {messages.length === 0 ? (
        <Text className={`text-center py-10 opacity-50 ${theme.text}`}>
          Start a conversation
        </Text>
      ) : (
        messages.map((msg) => (
          <View
            key={msg.id}
            className={`mb-4 max-w-[85%] rounded-2xl p-3 ${
              msg.role === "user"
                ? "self-end bg-blue-600"
                : `self-start ${assistantBubbleBg}`
            }`}
          >
            <Text className={msg.role === "user" ? "text-white" : theme.text}>
              {msg.content}
            </Text>
            {msg.fileName && (
              <Text
                className={`mt-1 text-[10px] italic opacity-70 ${
                  msg.role === "user" ? "text-white" : assistantMetaText
                }`}
              >
                Attachment: {msg.fileName}
              </Text>
            )}
          </View>
        ))
      )}
      {isLoading && (
        <Text className={`text-xs animate-pulse opacity-50 ${theme.text}`}>
          AI is thinking...
        </Text>
      )}
    </ScrollView>
  );
}
