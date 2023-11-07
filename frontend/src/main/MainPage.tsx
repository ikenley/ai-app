import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Navbar from "../shared/Navbar";

// Based on:
// https://github.com/mui/material-ui/tree/v5.14.17/docs/data/material/getting-started/templates/pricing

const MainPage = () => {
  return (
    <div className="main-page">
      <Navbar />
      <Container maxWidth="sm" component="main" sx={{ mt: 3 }}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          AI App
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          component="p"
        >
          A very simple AI client
        </Typography>
      </Container>
    </div>
  );
};

export default MainPage;
