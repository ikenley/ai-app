import { ReactNode } from "react";
import { useAuthContext } from "./AuthContext";
import Loadmask from "../shared/Loadmask";

type Props = {
  children: ReactNode;
};

/** React-router route that requires authentication. */
const PrivateRoute = ({ children }: Props) => {
  const { isLoading, isAuthenticated } = useAuthContext();

  if (isLoading) {
    return <Loadmask />;
  } else if (!isAuthenticated) {
    return <div>Unauthorized</div>;
  }

  return <>{children}</>;
};

export default PrivateRoute;
