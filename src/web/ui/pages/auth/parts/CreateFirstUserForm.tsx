"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "../../../../providers/betterAuthWebClient";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import logger from "../../../../../shared/utils/logger";
import { useTranslation } from "react-i18next";

/**
 * Composant de formulaire de création du premier utilisateur admin
 */
export const CreateFirstUserForm: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Admin");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/create-first-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      await response.json();

      if (!response.ok) {
        setError(t("auth.createUserError"));
        setIsLoading(false);
        return;
      }

      // Connexion automatique après création
      try {
        const signInResult = await signIn.email({
          email,
          password,
          rememberMe: true,
        });

        if (signInResult.error) {
          setError(t("auth.userCreatedButSignInError"));
          setIsLoading(false);
          window.location.reload();
          return;
        }

        await queryClient.invalidateQueries({ queryKey: ["admin-me"] });
        router.push("/");
        router.refresh();
      } catch {
        setError(t("auth.userCreatedButSignInError"));
        setIsLoading(false);
        // Recharger la page pour afficher le formulaire de connexion
        window.location.reload();
      }
    } catch (error: unknown) {
      logger.error("CreateFirstUserForm", error);

      setError(error instanceof Error ? error.message : t("auth.genericError"));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0e14]">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#1a1d29] rounded-lg border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("auth.initialSetup")}
          </h1>
          <p className="text-gray-400">{t("auth.initialSetupSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300"
            >
              {t("auth.name")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0b0e14] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("auth.namePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0b0e14] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("auth.emailPlaceholderAdmin")}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              {t("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 bg-[#0b0e14] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("auth.passwordPlaceholder")}
            />
            <p className="text-xs text-gray-500">
              {t("auth.passwordMinLength")}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isLoading ? t("auth.creating") : t("auth.createAdminButton")}
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500">
          <p>{t("auth.initialSetupNote")}</p>
        </div>
      </div>
    </div>
  );
};
