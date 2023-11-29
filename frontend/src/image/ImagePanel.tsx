import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import { useApiClient } from "../hooks/ApiClientContext";

const styles = [
  "8-bit video game",
  "Art Deco",
  "Baroque",
  "Cubism",
  "Dutch Golden Age",
  "Expressionism",
  "Fauvism",
  "Impressionism",
  "Magical Realism",
  "New Deal poster",
  "Primitivism",
  "Realism",
  "Renaissance",
  "Romanticism",
  "Rococo",
  "Soviet propaganda",
  "Surrealism",
  "Ukiyo-e",
];

const ImagePanel = () => {
  const { createImage } = useApiClient();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(styles[7]);

  const handlePromptChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPrompt(event.target.value);
    },
    [setPrompt]
  );

  const handleStyleChange = (event: SelectChangeEvent) => {
    setStyle(event.target.value as string);
  };

  const { mutate: handleCreateImage, isLoading: punIsLoading } = useMutation(
    createImage,
    {}
  );

  const handleSubmit = useCallback(() => {
    const combinedPrompt = `${prompt} in the style of ${style}`;
    handleCreateImage({ prompt: combinedPrompt });
    toast.success("Image requested! You should receive an email soon.");
  }, [handleCreateImage, prompt, style]);

  return (
    <Box className="pun-panel" sx={{ mt: 5 }}>
      <form onSubmit={(event) => event.preventDefault()}>
        <TextField
          id="outlined-basic"
          name="prompt"
          label="Generate an image based on the prompt..."
          variant="outlined"
          fullWidth
          value={prompt}
          onChange={handlePromptChange}
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="image-panel-style-select-label">Style</InputLabel>
          <Select
            labelId="image-panel-style-select-label"
            id="image-panel-style-select"
            value={style}
            label="Age"
            onChange={handleStyleChange}
          >
            {styles.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          fullWidth
          size="large"
          type="submit"
          sx={{ mt: 3 }}
          disabled={!prompt || punIsLoading}
          onClick={handleSubmit}
        >
          Generate Image
        </Button>
      </form>
    </Box>
  );
};

export default ImagePanel;
