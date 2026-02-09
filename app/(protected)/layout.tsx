"use client";

import React, { Suspense } from "react";
import Sidebar from "../../src/web/ui/components/layout/Sidebar";
import { useStoresInit } from "../../src/web/core/hooks/useStoresInit";

/**
 * Layout protégé qui utilise ProtectedRoute pour vérifier l'authentification
 * Toutes les routes sous (protected) nécessitent une authentification
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useStoresInit();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#0b0e14]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
        </div>
      }
    >
      <div className="flex h-screen overflow-hidden bg-[#0b0e14]">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </Suspense>
  );
}
