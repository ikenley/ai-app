import {
  AssistantActionBar,
  AssistantMessage,
  BranchPicker,
  useMessageContext,
} from "@assistant-ui/react";
import { Avatar, Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";

/** A message written by the AI.
 * https://www.assistant-ui.com/docs/ui/styled/Decomposition#assistantmessage
 */
const AiAssistantMessage = () => {
  const theme = useTheme();
  const messageContext = useMessageContext();
  const message = messageContext.useMessage();
  const isLoading = message.status?.type === "running";

  return (
    <AssistantMessage.Root>
      {isLoading ? (
        <CircularProgress size="35px" sx={{ mr: 1 }} />
      ) : (
        <Avatar
          sx={{
            color: "#fff",
            backgroundColor: theme.palette.primary.main,
            mr: 1,
          }}
        >
          <SmartToyIcon />
        </Avatar>
      )}
      {isLoading ? (
        <Box className="aui-assistant-message-content ">
          <div className="aui-md-root loading-ellipsis">Loading</div>
        </Box>
      ) : (
        <AssistantMessage.Content />
      )}
      {/* <AiAssistantMessageContent /> */}
      <BranchPicker />
      <AssistantActionBar />
    </AssistantMessage.Root>
  );
};

export default AiAssistantMessage;
