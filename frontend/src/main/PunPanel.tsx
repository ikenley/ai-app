import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useMutation } from "react-query";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import { useApiClient } from "../hooks/ApiClientContext";

const PunPanel = () => {
  const { createPun } = useApiClient();
  const [prompt, setPrompt] = useState("");

  const handlePromptChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPrompt(event.target.value);
    },
    [setPrompt]
  );

  const {
    mutate: handleCreatePun,
    isLoading: punIsLoading,
    data: punResponse,
  } = useMutation(createPun, {});

  const handleCopy = useCallback(() => {
    if (!punResponse) {
      return;
    }
    copy(punResponse.content);
    toast.success("Copied to clipboard");
  }, [punResponse]);

  return (
    <Box className="pun-panel" sx={{ mt: 5 }}>
      <form onSubmit={(event) => event.preventDefault()}>
        <TextField
          id="outlined-basic"
          name="prompt"
          label="Generate a pun based on the words..."
          variant="outlined"
          fullWidth
          value={prompt}
          onChange={handlePromptChange}
        />
        <Button
          variant="contained"
          fullWidth
          size="large"
          type="submit"
          sx={{ mt: 3 }}
          disabled={!prompt || punIsLoading}
          onClick={() => {
            handleCreatePun({ prompt });
          }}
        >
          Generate Pun
        </Button>
      </form>
      <Box className="pun-results" sx={{ mt: 3 }}>
        {punIsLoading ? (
          <Skeleton data-testid="pun-panel-result-loading" height={100} />
        ) : punResponse ? (
          <div>
            <div>{punResponse.content}</div>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              sx={{ mt: 1 }}
              onClick={handleCopy}
            >
              <ContentCopyIcon /> Copy to Clipboard
            </Button>
          </div>
        ) : null}
      </Box>
    </Box>
  );
};

export default PunPanel;
