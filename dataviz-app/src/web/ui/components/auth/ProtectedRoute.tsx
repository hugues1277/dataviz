"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../../providers/betterAuthWebClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [session, router, isPending]);

  return <>{children}</>;
};
