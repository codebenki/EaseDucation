import { ChatMessage } from "@/app/(drawer)/(tabs)/chat";

interface ChatResponse {
  answer: string;
  thread_id: string;
}

interface SendMessageParams {
  serverIp: string;
  formData: FormData;
  profilesId: string;
  threadId?: string;
}

export async function sendChatMessage({
  serverIp,
  formData,
  profilesId,
  threadId,
}: SendMessageParams): Promise<ChatResponse> {
  const url = `http://${serverIp}:8010/chat`;

  // Append context
  formData.append("profiles_id", profilesId);
  if (threadId) {
    formData.append("thread_id", threadId);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });

  const responseText = await response.text();
  let responseData: any = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { answer: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(responseData?.message || "Request failed");
  }

  return {
    answer: responseData?.answer ?? "No answer returned from the server.",
    thread_id: responseData?.thread_id,
  };
}
