"use client";

import React from "react";
import Sidebar from "../../src/web/ui/components/layout/Sidebar";
import { useStoresInit } from "../../src/web/core/hooks/useStoresInit";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useStoresInit();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0e14]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
