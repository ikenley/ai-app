"use client";

import { useMemo, type ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { v4 as uuidv4 } from "uuid";
import { useApiClient } from "../hooks/ApiClientContext";
import { SendChatParams, SendChatResponse } from "../types";

/** Integrate custom REST API with assistant-ui data workflow.
 * See https://www.assistant-ui.com/docs/runtimes/custom-rest
 */
const getModelAdapter = (
  sendChatPrompt: (params: SendChatParams) => Promise<SendChatResponse>,
  sessionId: string
): ChatModelAdapter => {
  return {
    async run({ messages, abortSignal }) {
      const lastMessage = messages[messages.length - 1];
      const content = lastMessage.content[0];
      if (content.type !== "text") {
        throw new Error("Content type must be text");
      }

      const prompt = content.text;
      const response = await sendChatPrompt({ sessionId, prompt });

      return {
        content: [
          {
            type: "text",
            text: response.agentReply,
          },
        ],
      };
    },
  };
};

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { sendChatPrompt } = useApiClient();
  const sessionId = useMemo(() => uuidv4(), []);

  const myModelAdapter = getModelAdapter(sendChatPrompt, sessionId);
  const runtime = useLocalRuntime(myModelAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
