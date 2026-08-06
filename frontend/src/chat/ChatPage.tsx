import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import "@assistant-ui/react/styles/index.css";
import Navbar from "../shared/Navbar";
import AiChatPanel from "./AiChatPanel";
import { ApiRuntimeProvider } from "./ApiRuntimeProvider";

const ChatPage = () => {
  return (
    <div className="chat-page">
      <ApiRuntimeProvider>
        <Navbar />
        <Container maxWidth="md" component="main" sx={{ mt: 2 }}>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            component="p"
            sx={{ mb: 1 }}
          >
            Chat with an AI bot
          </Typography>
          {/* <ChatPanel /> */}
          <AiChatPanel />
        </Container>
      </ApiRuntimeProvider>
    </div>
  );
};

export default ChatPage;
