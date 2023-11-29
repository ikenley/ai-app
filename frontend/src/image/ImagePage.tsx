import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Navbar from "../shared/Navbar";
import PunPanel from "./ImagePanel";

const ImagePage = () => {
  return (
    <div className="image-page">
      <Navbar />
      <Container maxWidth="sm" component="main" sx={{ mt: 3 }}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Image GenerAItor
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          component="p"
        >
          A simple image AI client
        </Typography>
        <PunPanel />
      </Container>
    </div>
  );
};

export default ImagePage;
