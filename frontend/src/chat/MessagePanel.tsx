import { Avatar, Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { MessageType } from "../types/frontEndTypes";
import "./MessagePanel.css";

// Thanks to: https://codesandbox.io/p/sandbox/material-ui-chat-drh4l

type Props = {
  message: React.ReactNode;
  messageType: MessageType;
  isLoading?: boolean;
};

export const MessagePanel = ({ message, messageType, isLoading }: Props) => {
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
      {isSent ? null : isLoading ? (
        <CircularProgress size="35px" />
      ) : (
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
        className="message-panel-message"
        sx={{
          position: "relative",
          marginLeft: isSent ? undefined : "10px",
          //marginRight: isSent ? "0px" : undefined,
          marginBottom: "10px",
          padding: "10px",
          textAlign: "left",
          font: "400 .9em 'Open Sans', sans-serif",
          border: "1px solid #97C6E3",
          borderRadius: "10px",
          backgroundColor: isSent ? "#f8e896" : "#A8DDFD",
          width: "75%",
        }}
      >
        <Box sx={{ p: 0, m: 0, whiteSpace: "pre-wrap" }}>{message}</Box>
      </Box>
    </Box>
  );
};

export default MessagePanel;
