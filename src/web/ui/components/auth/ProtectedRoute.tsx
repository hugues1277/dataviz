import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSession } from "../../../providers/betterAuthWebClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate("/sign-in");
    }
  }, [session, navigate, isPending]);

  return <>{children}</>;
};
