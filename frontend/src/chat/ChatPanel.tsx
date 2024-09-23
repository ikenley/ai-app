import React, { useCallback, useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import { useApiClient } from "../hooks/ApiClientContext";
import MessagePanel from "./MessagePanel";
import { Paper } from "@mui/material";
import ChatTextInput from "./ChatTextInput";
import { Message, MessageType } from "../types/frontEndTypes";
import AlwaysScrollToBottom from "../shared/AlwaysScrollToBottom";

const initialMessages: Message[] = [
  {
    id: "0",
    text: (
      <div>
        Welcome to an AI Chat agent demo! This "chat agent" combines three
        capabilities:{" "}
        <ol>
          <li>A private copy of a foundational AI model</li>
          <li>A "Knowledge Base" of proprietary internal data</li>
          <li>
            "Action Groups" that allow the AI agent to perform internal API
            calls. For example, try asking it to send you an email summary of
            your conversation.
          </li>
        </ol>
      </div>
    ),
    messageType: MessageType.Received,
  },
  {
    id: "1",
    messageType: MessageType.Received,
    text: "Morbi nec convallis eros. Aenean volutpat imperdiet diam, at ultricies nibh efficitur at.",
  },
  {
    id: "2",
    messageType: MessageType.Sent,
    text: "Nullam maximus tempus mi tristique dictum. Etiam ac urna vitae odio iaculis tristique. Vivamus sed augue eu justo aliquet pulvinar. Ut sagittis, mi quis tempor fringilla, tellus eros viverra elit, auctor elementum erat dolor ut dui.",
  },
  {
    id: "3",
    messageType: MessageType.Sent,
    text: "Nullam tempor volutpat tellus quis laoreet. Suspendisse ut erat magna.",
  },
];

const ChatPanel = () => {
  const { sendChatPrompt } = useApiClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const sessionId = useMemo(() => uuidv4(), []);

  const {
    mutate: handleSendPrompt,
    reset: resetSendPrompt,
    data: sendChatResponse,
    isLoading: isLoadingSendPrompt,
  } = useMutation(sendChatPrompt, {});

  // Handle sendChatPrompt response
  useEffect(() => {
    if (sendChatResponse) {
      const responsMessage: Message = {
        id: uuidv4(),
        text: sendChatResponse.agentReply,
        messageType: MessageType.Received,
      };
      const nextMessages = [...messages, responsMessage];
      setMessages(nextMessages);
      resetSendPrompt();
    }
  }, [sendChatResponse, resetSendPrompt, messages, setMessages]);

  const handleSubmit = useCallback(
    (prompt: string) => {
      // Add prompt to user's messages TODO
      const sentMessage: Message = {
        id: uuidv4(),
        text: prompt,
        messageType: MessageType.Sent,
      };
      const nextMessages = [...messages, sentMessage];
      setMessages(nextMessages);

      // Get response
      handleSendPrompt({ sessionId, prompt });
      toast.success("Storybook requested! You should receive an email soon.");
    },
    [handleSendPrompt, messages, setMessages]
  );

  return (
    <Box className="chat-panel">
      <Paper
        className="chat-panel-paper-outer"
        elevation={2}
        sx={{
          height: "calc(100vh - 250px)",
          maxHeight: "700px",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          position: "relative",
          mb: 3,
        }}
      >
        <Paper
          className="chat-panel-paper-inner"
          sx={{
            m: 0,
            px: 2,
            py: 1,
            overflowY: "scroll",
            height: "calc( 100% - 80px )",
            borderRadius: 0,
            flex: 1,
          }}
        >
          {messages.map((m) => (
            <MessagePanel
              key={m.id}
              messageType={m.messageType}
              message={m.text}
            />
          ))}
          {isLoadingSendPrompt && (
            <MessagePanel
              messageType={MessageType.Received}
              message={<div className="loading-ellipsis">Loading</div>}
              isLoading={true}
            />
          )}
          <AlwaysScrollToBottom />
        </Paper>
        <ChatTextInput handleSubmit={handleSubmit} />
      </Paper>
    </Box>
  );
};

export default ChatPanel;
