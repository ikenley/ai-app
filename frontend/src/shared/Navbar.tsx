import { useState, useMemo } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import GitHubIcon from "@mui/icons-material/GitHub";
import LogoutIcon from "@mui/icons-material/Logout";
import Skeleton from "@mui/material/Skeleton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useAuthContext } from "../auth/AuthContext";
import config from "../config";

const Navbar = () => {
  const { user } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const logoutUrl = useMemo(() => {
    const returnUrl = encodeURI(global.location.toString());
    const url = `${config.authApiPrefix}/login?r=${returnUrl}`;
    return url;
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" color="default" className="nabar">
      <Toolbar sx={{ flexWrap: "wrap" }}>
        <Typography
          variant="h6"
          color="inherit"
          noWrap
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          GenerAItor
        </Typography>
        <Box sx={{ flexGrow: 1, display: { xs: "flex" } }}>
          <Link
            className="navbar-link"
            component={RouterLink}
            to="/ai/pun"
            sx={{
              ml: { xs: 0, md: 3 },
              my: 3,
              display: "block",
              textDecoration: "none",
            }}
          >
            Pun
          </Link>
          <Link
            className="navbar-link"
            component={RouterLink}
            to="/ai/image"
            sx={{ ml: 2, my: 3, display: "block", textDecoration: "none" }}
          >
            Image
          </Link>
          <Link
            className="navbar-link"
            component={RouterLink}
            to="/ai/storybook"
            sx={{ ml: 2, my: 3, display: "block", textDecoration: "none" }}
          >
            Storybook
          </Link>
          <Link
            className="navbar-link"
            component={RouterLink}
            to="/ai/chat"
            sx={{ ml: 2, my: 3, display: "block", textDecoration: "none" }}
          >
            Chat
          </Link>
        </Box>
        {user === null ? (
          <Skeleton />
        ) : (
          <>
            <Button color="inherit" onClick={handleMenu}>
              {user.email}
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem href="https://github.com/ikenley/ai-app" component="a">
                <ListItemIcon>
                  <GitHubIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Github Source</ListItemText>
              </MenuItem>
              <MenuItem href={logoutUrl} component="a">
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
