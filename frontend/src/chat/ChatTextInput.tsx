import { FormEvent, useCallback, useRef } from "react";
import { Box, Button, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

type Props = {
  handleSubmit: (prompt: string) => void;
};

export const ChatTextInput = ({ handleSubmit }: Props) => {
  const promptRef = useRef<HTMLInputElement>();
  // TODO clear prompt on submit
  // https://reacttraining.com/blog/react-and-form-data

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const promptInput = promptRef?.current;

      if (promptInput) {
        const promptValue = promptInput.value;
        const prompt = promptValue.trim();

        if (prompt && prompt !== "") {
          handleSubmit(prompt);
          promptInput.value = "";
        }
      }
    },
    [handleSubmit]
  );

  return (
    <Box className="chat-text-input" sx={{ display: "flex", width: "100%" }}>
      <form
        noValidate
        autoComplete="off"
        onSubmit={onSubmit}
        style={{
          display: "flex",
          width: "100%",
        }}
      >
        <TextField
          id="chat-text-input-text-field"
          name="prompt"
          inputRef={promptRef}
          // multiline={true}
          sx={{ flex: 1, borderRadius: 0 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ borderRadius: 0 }}
        >
          <SendIcon />
        </Button>
      </form>
    </Box>
  );
};

export default ChatTextInput;
