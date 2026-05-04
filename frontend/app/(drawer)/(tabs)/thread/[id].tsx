import { supabase } from "@/services/supabase.service";
import Chat from "../chat";
import { useEffect, useState } from "react";
import { usePathname } from "expo-router";

interface Message {
  id: string;
  role: string;
  content: string;
}

export default function Thread() {
  const [messages, setMessages] = useState<Message[]>([]);
  const thread_id = usePathname().split("/");
  useEffect(() => {
    const fetchThreads = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, content")
        .eq("thread_id", thread_id[2])
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchThreads();
  }, []);
  // message doesnt render when switching to other thread id
  return (
    <Chat
      key={thread_id[2]}
      initialMessages={messages as []}
      threadId={thread_id[2]}
    />
  );
}
