import { Paper } from "@mui/material";
import AiThread from "./AiThread";

/** Open source chat UI.
 * Extends https://www.assistant-ui.com/docs/ui/styled/Thread */
const AiChatPanel = () => {
  return (
    <Paper
      className="ai-chat-panel"
      elevation={2}
      sx={{
        height: "calc(100vh - 160px)",
        maxHeight: "700px",
        // display: "flex",
        // alignItems: "center",
        // flexDirection: "column",
        // position: "relative",
        mb: 3,
      }}
    >
      <AiThread />
    </Paper>
  );
};

export default AiChatPanel;
