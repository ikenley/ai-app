import { Avatar, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { MessageType } from "../types/frontEndTypes";
import React from "react";

// Thanks to: https://codesandbox.io/p/sandbox/material-ui-chat-drh4l

type Props = {
  message: React.ReactNode;
  messageType: MessageType;
};

export const MessagePanel = ({ message, messageType }: Props) => {
  const theme = useTheme();
  const isSent = messageType === MessageType.Sent;

  return (
    <Box
      className="message"
      sx={{
        display: "flex",
        justifyContent: isSent ? "flex-end" : undefined,
      }}
    >
      {!isSent && (
        <Avatar
          sx={{
            color: "#fff",
            backgroundColor: theme.palette.primary.main,
          }}
        >
          <SmartToyIcon />
        </Avatar>
      )}
      <Box
        sx={{
          position: "relative",
          marginLeft: isSent ? undefined : "10px",
          marginBottom: "10px",
          padding: "10px",
          textAlign: "left",
          font: "400 .9em 'Open Sans', sans-serif",
          border: "1px solid #97C6E3",
          borderRadius: "10px",
          marginRight: isSent ? "0px" : undefined,
          backgroundColor: isSent ? "#f8e896" : "#A8DDFD",
          width: "75%",
        }}
      >
        <Box>
          <Box sx={{ p: 0, m: 0 }}>{message}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MessagePanel;
