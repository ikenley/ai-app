import React, { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

const responseGoogle = (response: any) => {
  //console.log(response);
};

const LoginButton = () => {
  const authContext = useContext(AuthContext);

  return (
    <div>TODO</div>
    // <GoogleLogin
    //   clientId="40576505573-35gusqr80mdhv8v4vmpvqmdr9g1t40kq.apps.googleusercontent.com"
    //   buttonText="Login"
    //   onSuccess={authContext.handleLogin}
    //   onFailure={responseGoogle}
    //   onAutoLoadFinished={authContext.onAutoLoadFinished}
    //   cookiePolicy={"single_host_origin"}
    //   isSignedIn={true}
    // />
  );
};

export default LoginButton;
