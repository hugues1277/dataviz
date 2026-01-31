import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  isDisabledAuth,
  useSession,
} from "../../../providers/betterAuthWebClient";
import { isTauri } from "../../../../shared/utils/platform";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // do not redirect to /sign-in if authentication is disabled
    if (isDisabledAuth) {
      return;
    }

    if (!isPending && !session?.user) {
      navigate("/sign-in");
    }
  }, [session, navigate, isPending]);

  return <>{children}</>;
};
