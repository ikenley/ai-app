import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Navbar from "../shared/Navbar";
import StorybookPanel from "./StorybookPanel";

const StorybookPage = () => {
  return (
    <div className="storybook-page">
      <Navbar />
      <Container maxWidth="sm" component="main" sx={{ mt: 3 }}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Storybook GenerAItor
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          component="p"
        >
          Create an AI-generated online storybook.
        </Typography>
        <StorybookPanel />
      </Container>
    </div>
  );
};

export default StorybookPage;
