import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import { useMutation } from "react-query";
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
          disabled={!prompt}
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
          punResponse.content
        ) : (
          "No response"
        )}
      </Box>
    </Box>
  );
};

export default PunPanel;
