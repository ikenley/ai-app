import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Navbar from "../shared/Navbar";
import ChatPanel from "./ChatPanel";

const ChatPage = () => {
  return (
    <div className="chat-page">
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
        <ChatPanel />
      </Container>
    </div>
  );
};

export default ChatPage;
