import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { ChatMessage } from "../../app/(drawer)/(tabs)/chat";
import { Rocket } from "lucide-react-native";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  colorScheme: "light" | "dark";
  onQuizPress: (quizId: string) => void; // New Prop
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
  onQuizPress,
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
            {/* Message Content */}
            <Text className={msg.role === "user" ? "text-white" : theme.text}>
              {msg.content}
            </Text>

            {/* QUIZ ACTION CARD */}
            {msg.quiz_id && (
              <View className="mt-3 border-t border-zinc-500/20 pt-3">
                <Text
                  className={`text-xs font-bold mb-2 ${theme.text} opacity-70`}
                >
                  READY TO TEST YOUR KNOWLEDGE?
                </Text>
                <Pressable
                  onPress={() => onQuizPress(msg.quiz_id!)}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? "#46A302" : "#58CC02",
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                  className="rounded-xl py-3 items-center shadow-sm border-b-4 border-[#46A302]"
                >
                  <Text className="text-white font-black tracking-widest text-sm">
                    START QUIZ <Rocket />
                  </Text>
                </Pressable>
              </View>
            )}

            {/* File Attachment Meta */}
            {msg.fileName && (
              <Text
                className={`mt-2 text-[10px] italic opacity-70 ${
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
        <View className="self-start mb-4">
          <Text className={`text-xs animate-pulse opacity-50 ${theme.text}`}>
            EaseDucation is thinking...
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
