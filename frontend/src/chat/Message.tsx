import { Avatar, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { deepOrange } from "@mui/material/colors";
import SmartToyIcon from "@mui/icons-material/SmartToy";

// Thanks to: https://codesandbox.io/p/sandbox/material-ui-chat-drh4l

// TODO convert to standard sx
// const useStyles: any = makeStyles((theme: Theme) =>
//   createStyles({

//     orange: ,
//     // avatarNothing: {
//     //   color: "transparent",
//     //   backgroundColor: "transparent",
//     //   width: theme.spacing(4),
//     //   height: theme.spacing(4),
//     // },
//     displayName: ,
//   })
// );

type Props = {
  message?: string;
  photoURL?: string;
  displayName?: string;
  avatarDisp: boolean;
};

//avatarが左にあるメッセージ（他人）
export const MessageLeft = (props: Props) => {
  const theme = useTheme();
  const message = props.message ? props.message : "no message";
  const displayName = props.displayName ? props.displayName : "名無しさん";

  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <Avatar
        alt={displayName}
        sx={{
          color: "#fff",
          backgroundColor: theme.palette.primary.main,
          width: theme.spacing(4),
          height: theme.spacing(4),
        }}
      >
        <SmartToyIcon />
      </Avatar>
      <Box>
        <Box
          sx={{
            marginLeft: "20px",
          }}
        >
          {displayName}
        </Box>
        <Box
          sx={{
            position: "relative",
            marginLeft: "20px",
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#A8DDFD",
            //height: "50px",
            textAlign: "left",
            font: "400 .9em 'Open Sans', sans-serif",
            border: "1px solid #97C6E3",
            borderRadius: "10px",
            "&:after": {
              content: "''",
              position: "absolute",
              width: "0",
              height: "0",
              borderTop: "15px solid #A8DDFD",
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              top: "0",
              left: "-15px",
            },
            "&:before": {
              content: "''",
              position: "absolute",
              width: "0",
              height: "0",
              borderTop: "17px solid #97C6E3",
              borderLeft: "16px solid transparent",
              borderRight: "16px solid transparent",
              top: "-1px",
              left: "-17px",
            },
          }}
        >
          <Box>
            <Box sx={{ p: 0, m: 0 }}>{message}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const MessageRight = (props: Props) => {
  const message = props.message ? props.message : "no message";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <Box
        sx={{
          position: "relative",
          marginRight: "20px",
          marginBottom: "10px",
          padding: "10px",
          backgroundColor: "#f8e896",
          width: "60%",
          //height: "50px",
          textAlign: "left",
          font: "400 .9em 'Open Sans', sans-serif",
          border: "1px solid #dfd087",
          borderRadius: "10px",
          "&:after": {
            content: "''",
            position: "absolute",
            width: "0",
            height: "0",
            borderTop: "15px solid #f8e896",
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            top: "0",
            right: "-15px",
          },
          "&:before": {
            content: "''",
            position: "absolute",
            width: "0",
            height: "0",
            borderTop: "17px solid #dfd087",
            borderLeft: "16px solid transparent",
            borderRight: "16px solid transparent",
            top: "-1px",
            right: "-17px",
          },
        }}
      >
        <Box sx={{ p: 0, m: 0 }}>{message}</Box>
      </Box>
    </Box>
  );
};
