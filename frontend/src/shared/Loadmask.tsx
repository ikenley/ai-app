import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

/** A full-screen backdrop loadmask */
const Loadmask = () => {
  return (
    <Backdrop
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default Loadmask;
