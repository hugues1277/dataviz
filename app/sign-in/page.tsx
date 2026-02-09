"use client";

import React, { Suspense } from "react";
import { SignInPage } from "@/src/web/ui/pages/auth/SignInPage";

/**
 * Page de connexion pour Next.js App Router
 * Utilise Suspense pour gérer useSearchParams
 */
export default function SignIn() {
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
      <SignInPage />
    </Suspense>
  );
}
