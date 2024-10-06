import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import "@assistant-ui/react/styles/index.css";
import Navbar from "../shared/Navbar";
import { MyRuntimeProvider } from "./MyRuntimeProvider";
import AiChatPanel from "./AiChatPanel";

const ChatPage = () => {
  return (
    <div className="chat-page">
      <MyRuntimeProvider>
        <Navbar />
        <Container maxWidth="sm" component="main" sx={{ mt: 2 }}>
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
      </MyRuntimeProvider>
    </div>
  );
};

export default ChatPage;
