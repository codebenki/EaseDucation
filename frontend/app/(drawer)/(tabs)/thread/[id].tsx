import { supabase } from "@/services/supabase.service";
import Chat from "../chat";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Loader } from "lucide-react-native";

interface Message {
  id: string;
  role: string;
  content: string;
}

export default function Thread() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content")
        .eq("thread_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (data) setMessages(data as Message[]);
      setIsLoading(false);
    };
    if (id) fetchThreads();
  }, [id]);

  if (isLoading) return <Loader size={200} />;

  return (
    <Chat
      key={id as string}
      initialMessages={messages as []}
      threadId={id as string}
    />
  );
}
