import { Box, Button, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export const ChatTextInput = () => {
  return (
    <Box className="chat-text-input" sx={{ display: "flex", width: "100%" }}>
      <form
        noValidate
        autoComplete="off"
        style={{
          display: "flex",
          width: "100%",
        }}
      >
        <TextField
          id="chat-text-input-text-field"
          sx={{ flex: 1, borderRadius: 0 }}
        />
        <Button variant="contained" color="primary" sx={{ borderRadius: 0 }}>
          <SendIcon />
        </Button>
      </form>
    </Box>
  );
};

export default ChatTextInput;
