"use client";

import React, { useState, useEffect } from "react";
import { CreateFirstUserForm } from "./parts/CreateFirstUserForm";
import { SignInForm } from "./parts/SignInForm";
import logger from "../../../../shared/utils/logger";

/**
 * Page de connexion simplifiée
 * La gestion de la session et la redirection sont gérées par le middleware
 */
export const SignInPage: React.FC = () => {
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const [checkUsersError, setCheckUsersError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si des utilisateurs existent au chargement et si non, afficher le formulaire de création du premier utilisateur
  useEffect(() => {
    const checkUsers = async () => {
      try {
        setIsLoading(true);
        setCheckUsersError(null);
        const response = await fetch("/api/admin/check-has-users");
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setHasUsers(data.hasUsers);
      } catch (error: unknown) {
        logger.error("checkUsers", error);
        setCheckUsersError(
          error instanceof Error 
            ? error.message 
            : "Erreur lors de la vérification des utilisateurs"
        );
        // En cas d'erreur, on assume qu'il y a des utilisateurs pour permettre la connexion
        setHasUsers(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUsers();
  }, []);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0e14]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si la vérification des utilisateurs a échoué
  if (checkUsersError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0e14]">
        <div className="w-full max-w-md p-8 space-y-4 bg-[#1a1d29] rounded-lg border border-red-800">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Erreur</h2>
            <p className="text-gray-400 text-sm">{checkUsersError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Afficher le formulaire de création du premier utilisateur ou le formulaire de connexion
  return hasUsers === false ? <CreateFirstUserForm /> : <SignInForm />;
};
