import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import { useApiClient } from "../hooks/ApiClientContext";
import Message from "./Message";
import { Paper } from "@mui/material";
import ChatTextInput from "./ChatTextInput";
import { MessageType } from "../types/frontEndTypes";

// container: {
//   width: "100vw",
//   height: "100vh",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
// },

const ChatPanel = () => {
  const { createStory } = useApiClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // TODO ajax call

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [setTitle]
  );

  const { mutate: handleCreateStory, isLoading: storyIsLoading } = useMutation(
    createStory,
    {}
  );

  const handleSubmit = useCallback(() => {
    handleCreateStory({ title, description });
    toast.success("Storybook requested! You should receive an email soon.");
  }, [handleCreateStory, title, description]);

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
          <Message
            message="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lobortis vulputate urna, in mollis sem efficitur sit amet. "
            messageType={MessageType.Received}
          />
          <Message
            message="Morbi nec convallis eros. Aenean volutpat imperdiet diam, at ultricies nibh efficitur at. "
            messageType={MessageType.Received}
          />
          <Message
            message="Nullam maximus tempus mi tristique dictum. Etiam ac urna vitae odio iaculis tristique. Vivamus sed augue eu justo aliquet pulvinar. Ut sagittis, mi quis tempor fringilla, tellus eros viverra elit, auctor elementum erat dolor ut dui."
            messageType={MessageType.Sent}
          />
          <Message
            message="Nullam tempor volutpat tellus quis laoreet. Suspendisse ut erat magna."
            messageType={MessageType.Sent}
          />
        </Paper>
        <ChatTextInput />
      </Paper>
    </Box>
  );
};

export default ChatPanel;
