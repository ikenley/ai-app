import type { ReactNode } from "react";
import Loadmask from "../shared/Loadmask";
import { useAuthContext } from "./AuthContext";

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
