"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../../../src/web/providers/betterAuthWebClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [session, router, isPending]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}
