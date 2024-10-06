import { ThreadWelcome } from "@assistant-ui/react";
import { Avatar, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import "./AiThreadWelcome.css";

const AiThreadWelcome = () => {
  const theme = useTheme();

  return (
    <ThreadWelcome.Root className="ai-thread-welcome">
      <ThreadWelcome.Center>
        <Avatar
          sx={{
            color: "#fff",
            backgroundColor: theme.palette.primary.main,
          }}
        >
          <SmartToyIcon />
        </Avatar>
        <Box className="ai-thread-welcome-message" sx={{ mt: 1 }}>
          Welcome to an AI chat demo! This "chat agent" combines three
          capabilities:{" "}
          <ol>
            <li>A private copy of a foundational AI model</li>
            <li>A "Knowledge Base" of internal data</li>
            <li>
              "Action Groups" that allow the agent to make internal API calls.
              For example, try asking it to send you an email summary of your
              conversation.
            </li>
          </ol>
        </Box>
      </ThreadWelcome.Center>
      <ThreadWelcome.Suggestions />
    </ThreadWelcome.Root>
  );
};

export default AiThreadWelcome;
