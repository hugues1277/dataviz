import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSession } from "../../../providers/auth/authProvider";
import { CreateFirstUserForm } from "./parts/CreateFirstUserForm";
import { SignInForm } from "./parts/SignInForm";
import logger from "../../../../shared/utils/logger";

export const SignInPage: React.FC = () => {
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  // Vérifier si des utilisateurs existent au chargement et si non, afficher le formulaire de création du premier utilisateur
  useEffect(() => {
    const checkUsers = async () => {
      try {
        const response = await fetch("/api/admin/check-has-users");
        const data = await response.json();
        setHasUsers(data.hasUsers);
      } catch (error: unknown) {
        logger.error("checkUsers", error);
      }
    };

    checkUsers();
  }, [setHasUsers]);

  // Vérifier la session après avoir vérifié les utilisateurs
  useEffect(() => {
    if (isPending || hasUsers === null) {
      return;
    }

    // Si l'utilisateur est déjà connecté, rediriger vers l'accueil
    if (session?.user) {
      navigate("/");
    }
  }, [isPending, session, hasUsers, navigate]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0e14]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return hasUsers === false ? <CreateFirstUserForm /> : <SignInForm />;
};
