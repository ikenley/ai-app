import { Thread, Composer, type ThreadConfig } from "@assistant-ui/react";
import AiThreadWelcome from "./AiThreadWelcome";
import AiAssistantMessage from "./AiAssistantMessage";
import "./AiThread.css";

/** Custom overrides for assistant-ui Thread.
 * https://www.assistant-ui.com/docs/ui/styled/Decomposition
 */
const AiThread = (config: ThreadConfig) => {
  return (
    <Thread.Root config={config}>
      <Thread.Viewport>
        <AiThreadWelcome />
        <Thread.Messages
          components={{ AssistantMessage: AiAssistantMessage }}
        />
        <Thread.FollowupSuggestions />
        <Thread.ViewportFooter>
          <Thread.ScrollToBottom />
          <Composer />
        </Thread.ViewportFooter>
      </Thread.Viewport>
    </Thread.Root>
  );
};

export default AiThread;
