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
  const [artNote, setArtNote] = useState("");

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

  const handleArtNoteChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setArtNote(event.target.value);
    },
    [setArtNote]
  );

  const { mutate: handleCreateStory, isLoading: storyIsLoading } = useMutation(
    createStory,
    {}
  );

  const handleSubmit = useCallback(() => {
    handleCreateStory({ title, description, artNote });
    toast.success("Storybook requested! You should receive an email soon.");
  }, [handleCreateStory, title, description, artNote]);

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
        />
        <TextField
          id="outlined-basic"
          name="description"
          label="Description"
          variant="outlined"
          fullWidth
          value={description}
          onChange={handleDescriptionChange}
          sx={{ my: 2 }}
        />
        <TextField
          id="outlined-basic"
          name="artNote"
          label="Art note"
          variant="outlined"
          fullWidth
          value={artNote}
          onChange={handleArtNoteChange}
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
