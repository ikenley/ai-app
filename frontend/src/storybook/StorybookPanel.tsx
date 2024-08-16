import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import { useApiClient } from "../hooks/ApiClientContext";

const ImagePanel = () => {
  const { createStory } = useApiClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [setTitle]
  );

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDescription(event.target.value);
    },
    [setDescription]
  );

  const { mutate: handleCreateStory, isLoading: storyIsLoading } = useMutation(
    createStory,
    {}
  );

  const handleSubmit = useCallback(() => {
    handleCreateStory({ title, description });
    toast.success("Storybook requested! You should receive an email soon.");
  }, [handleCreateStory, title, description]);

  return (
    <Box className="pun-panel" sx={{ mt: 5 }}>
      <form onSubmit={(event) => event.preventDefault()}>
        <TextField
          id="outlined-basic"
          name="title"
          label="Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={handleTitleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          id="outlined-basic"
          name="description"
          label="Description"
          variant="outlined"
          fullWidth
          value={description}
          onChange={handleDescriptionChange}
        />
        <Button
          variant="contained"
          fullWidth
          size="large"
          type="submit"
          sx={{ mt: 3 }}
          disabled={!prompt || storyIsLoading}
          onClick={handleSubmit}
        >
          Generate Story
        </Button>
      </form>
    </Box>
  );
};

export default ImagePanel;
