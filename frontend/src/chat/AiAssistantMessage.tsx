import {
  AssistantActionBar,
  AssistantMessage,
  BranchPicker,
} from "@assistant-ui/react";
import { Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";

/** A message written by the AI.
 * https://www.assistant-ui.com/docs/ui/styled/Decomposition#assistantmessage
 */
const AiAssistantMessage = () => {
  const theme = useTheme();

  return (
    <AssistantMessage.Root>
      <Avatar
        sx={{
          color: "#fff",
          backgroundColor: theme.palette.primary.main,
          mr: 1,
        }}
      >
        <SmartToyIcon />
      </Avatar>
      {/* <AssistantMessage.Avatar /> */}
      <AssistantMessage.Content />
      <BranchPicker />
      <AssistantActionBar />
    </AssistantMessage.Root>
  );
};

export default AiAssistantMessage;
