import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as DocumentPicker from "expo-document-picker";
import { Paperclip, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Platform, Text, View } from "react-native";

interface ChatInputProps {
  theme: {
    text: string;
    inputBg: string;
    border: string;
    previewBg: string;
  };
  colorScheme: "light" | "dark";
  onSend: (data: {
    formData: FormData;
    message: string;
    fileName?: string;
  }) => void;
}

export function ChatInput({ theme, colorScheme, onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [attachedFile, setAttachedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const inputRef = useRef<React.ComponentRef<typeof Input>>(null);

  type WebDocumentPickerAsset = DocumentPicker.DocumentPickerAsset & {
    file?: File;
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setAttachedFile(result.assets[0]);
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const handleSend = () => {
    if (message.trim() || attachedFile) {
      const formData = new FormData();
      const finalMessage = message.trim() || "Summarize this document.";

      formData.append("message", finalMessage);

      if (attachedFile) {
        const webFile = (attachedFile as WebDocumentPickerAsset).file;

        if (Platform.OS === "web" && webFile) {
          formData.append("file", webFile);
        } else {
          formData.append("file", {
            uri: attachedFile.uri,
            name: attachedFile.name || "attachment.file",
            type: attachedFile.mimeType || "application/octet-stream",
          } as any);
        }
      }

      onSend({
        formData,
        message: finalMessage,
        fileName: attachedFile?.name,
      });

      setMessage("");
      setAttachedFile(null);
      setInputHeight(40);
    }
  };

  return (
    <View className={`border-t ${theme.border}`}>
      {attachedFile && (
        <View
          className={`px-4 py-2 flex-row items-center justify-between ${theme.previewBg}`}
        >
          <View className="flex-row items-center gap-2 flex-1">
            <Paperclip size={14} className="text-blue-500" />
            <Text className={`${theme.text} text-sm flex-1`} numberOfLines={1}>
              {attachedFile.name}
            </Text>
          </View>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onPress={() => setAttachedFile(null)}
          >
            <X size={16} className="text-zinc-500" />
          </Button>
        </View>
      )}

      <View className="p-4 flex-row items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          onPress={handlePickDocument}
        >
          <Paperclip
            size={20}
            className={
              colorScheme === "dark" ? "text-zinc-400" : "text-zinc-500"
            }
          />
        </Button>

        <Input
          ref={inputRef}
          value={message}
          onChangeText={setMessage}
          placeholder={attachedFile ? "Add a message..." : "Chat"}
          multiline
          blurOnSubmit={false}
          textAlignVertical="top"
          scrollEnabled={inputHeight >= 100}
          onContentSizeChange={(e) => {
            const newHeight = e.nativeEvent.contentSize.height;
            if (newHeight <= 100) setInputHeight(newHeight);
          }}
          style={{ height: Math.max(40, inputHeight) }}
          className={`flex-1 rounded-2xl px-4 py-2.5 ${theme.inputBg} ${theme.text}`}
          placeholderTextColor={colorScheme === "dark" ? "#71717a" : "#a1a1aa"}
        />

        <Button className="h-10 px-4 rounded-2xl" onPress={handleSend}>
          <Text className="font-semibold text-white">Send</Text>
        </Button>
      </View>
    </View>
  );
}
