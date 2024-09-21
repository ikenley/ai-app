import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import { useApiClient } from "../hooks/ApiClientContext";
import { MessageLeft, MessageRight } from "./Message";
import { Paper } from "@mui/material";
import ChatTextInput from "./ChatTextInput";

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
          <MessageLeft
            message="あめんぼあかいなあいうえお"
            photoURL="https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c"
            displayName=""
            avatarDisp={true}
          />
          <MessageLeft
            message="xxxxxhttps://yahoo.co.jp xxxxxxxxxあめんぼあかいなあいうえおあいうえおかきくけこさぼあかいなあいうえおあいうえおかきくけこさぼあかいなあいうえおあいうえおかきくけこさいすせそ"
            photoURL=""
            displayName="テスト"
            avatarDisp={false}
          />
          <MessageRight
            message="messageRあめんぼあかいなあいうえおあめんぼあかいなあいうえおあめんぼあかいなあいうえお"
            photoURL="https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c"
            displayName="まさりぶ"
            avatarDisp={true}
          />
          <MessageRight
            message="messageRあめんぼあかいなあいうえおあめんぼあかいなあいうえお"
            photoURL="https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c"
            displayName="まさりぶ"
            avatarDisp={false}
          />
        </Paper>
        <ChatTextInput />
      </Paper>
    </Box>
  );
};

export default ChatPanel;
