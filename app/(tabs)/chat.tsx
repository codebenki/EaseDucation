import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Input } from "@/components/ui/input";
import { useColorScheme } from "@/hooks/use-color-scheme"; // Ensure this works for mobile
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function Chat() {
  const colorScheme = useColorScheme() ?? "light";
  const [inputHeight, setInputHeight] = useState(40);

  // Mapping themes to static strings so NativeWind can compile them
  const themeClasses = {
    light: {
      container: "bg-white",
      text: "text-black",
      inputBg: "bg-gray-100",
    },
    dark: {
      container: "bg-zinc-950",
      text: "text-white",
      inputBg: "bg-zinc-900",
    },
  };

  const currentTheme = themeClasses[colorScheme];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset={90} // Adjust this if the input is hidden by headers
      className="flex-1"
    >
      <ThemedView className={`flex-1 ${currentTheme.container}`}>
        {/* 1. Chat Message Area (Scrollable) */}
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        >
          <ThemedText className={`text-center py-10 ${currentTheme.text}`}>
            Start a conversation
          </ThemedText>
        </ScrollView>

        {/* 2. Input Area (Fixed to bottom) */}
        <View className="p-4 border-t border-gray-200/10">
          <Input
            placeholder="Chat"
            multiline={true}
            textAlignVertical="top"
            // Dynamic height logic
            onContentSizeChange={(e) => {
              const newHeight = e.nativeEvent.contentSize.height;
              if (newHeight <= 100) {
                setInputHeight(newHeight);
              }
            }}
            style={{ height: Math.max(40, inputHeight) }}
            // Styles
            className={`w-full self-center rounded-2xl px-4 py-2 ${currentTheme.inputBg} ${currentTheme.text}`}
            placeholderTextColor={
              colorScheme === "dark" ? "#a1a1aa" : "#71717a"
            }
          />
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
