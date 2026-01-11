import { Button } from "../../../components/shadcn/button";
import { signIn } from "../../../../providers/betterAuthWebClient";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import logger from "../../../../../shared/utils/logger";

/**
 * Composant de formulaire de création du premier utilisateur admin
 */
export const CreateFirstUserForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Admin");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la création de l'utilisateur");
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
          setError(
            "Utilisateur créé mais erreur lors de la connexion. Veuillez vous connecter manuellement."
          );
          setIsLoading(false);
          // Recharger la page pour afficher le formulaire de connexion
          window.location.reload();
          return;
        }

        // Redirection vers la page d'accueil
        navigate("/");
      } catch {
        setError(
          "Utilisateur créé mais erreur lors de la connexion. Veuillez vous connecter manuellement."
        );
        setIsLoading(false);
        // Recharger la page pour afficher le formulaire de connexion
        window.location.reload();
      }
    } catch (error: unknown) {
      logger.error("CreateFirstUserForm", error);

      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0e14]">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#1a1d29] rounded-lg border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Configuration initiale
          </h1>
          <p className="text-gray-400">
            Créez le premier utilisateur administrateur
          </p>
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
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0b0e14] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Admin"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0b0e14] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 bg-[#0b0e14] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500">Minimum 8 caractères</p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isLoading ? "Création..." : "Créer l'utilisateur admin"}
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500">
          <p>
            Cette page n'est accessible que lorsqu'aucun utilisateur n'existe
            dans la base de données.
          </p>
        </div>
      </div>
    </div>
  );
};
