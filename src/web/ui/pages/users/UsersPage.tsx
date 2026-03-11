"use client";

import React, { useState, useCallback } from "react";
import { Plus, Users, Trash2, Shield, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "../../components/layout/Header";
import PageHeader from "../../components/layout/PageHeader";
import PageLoading from "../../components/layout/PageLoading";
import { Button } from "../../components/Button";
import { useAdmin } from "../../../core/hooks/useAdmin";
import { useDialog } from "../../components/modal/DialogContext";
import UserEditor from "./parts/UserEditor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export type UserRole = "admin" | "read" | "edit";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  createdAt?: string;
}

async function fetchUsers(): Promise<AppUser[]> {
  const res = await fetch("/api/admin/users", { credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText);
  }
  return res.json();
}

async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}) {
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur");
  }
  return res.json();
}

async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: UserRole }
) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur");
  }
}

async function resetPassword(id: string, newPassword: string) {
  const res = await fetch(`/api/admin/users/${id}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur");
  }
}

async function deleteUser(id: string) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur");
  }
}

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { confirm } = useDialog();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AppUser | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsAdding(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; email?: string; role?: UserRole; password?: string };
    }) => {
      const { password, ...patchData } = data;
      const hasPatch = patchData.name !== undefined || patchData.email !== undefined || patchData.role !== undefined;
      if (hasPatch) {
        await updateUser(id, patchData);
      }
      if (password && password.length >= 8) {
        await resetPassword(id, password);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAdd = () => {
    setUserToEdit(null);
    setIsAdding(true);
  };
  const handleEdit = (u: AppUser) => setUserToEdit(u);
  const handleCloseEditor = () => {
    setIsAdding(false);
    setUserToEdit(null);
  };

  const handleSave = useCallback(
    async (data: {
      email?: string;
      password?: string;
      name?: string;
      role?: UserRole;
    }) => {
      if (userToEdit) {
        await updateUserMutation.mutateAsync({
          id: userToEdit.id,
          data: {
            name: data.name ?? userToEdit.name,
            email: data.email ?? userToEdit.email,
            role: data.role ?? userToEdit.role,
            password: data.password,
          },
        });
        setUserToEdit(null);
      } else {
        await createMutation.mutateAsync({
          email: data.email!,
          password: data.password!,
          name: data.name || data.email!.split("@")[0],
          role: data.role || "edit",
        });
      }
    },
    [userToEdit, updateUserMutation, createMutation]
  );

  const handleDelete = useCallback(
    (user: AppUser) => {
      confirm({
        title: t("users.deleteConfirmTitle"),
        description: t("users.deleteConfirmDesc", { name: user.name || user.email }),
        type: "danger",
        confirmLabel: t("common.delete"),
        onConfirm: async () => {
          await deleteMutation.mutateAsync(user.id);
        },
      });
    },
    [confirm, t, deleteMutation]
  );

  if (adminLoading || (isAdmin && usersLoading)) {
    return <PageLoading />;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <Header name={t("users.pageTitle")} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <Shield className="w-16 h-16 text-amber-500/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              {t("users.accessDenied")}
            </h2>
            <p className="text-gray-500 text-sm">{t("users.accessDeniedDesc")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header name={t("users.pageTitle")} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-6">
          <PageHeader
            title={t("users.title")}
            description={t("users.description")}
            actions={
              <Button onClick={handleAdd}>
                <Plus size={16} /> {t("users.addUser")}
              </Button>
            }
          />

          <div className="bg-[#111217] border border-[#1f2127] rounded-2xl overflow-hidden">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[#1f2127] last:border-b-0 hover:bg-[#181b1f] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Users size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-sm truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span
                    className={`text-[8px] font-black uppercase px-2 py-1 rounded shrink-0 ${
                      user.role === "admin"
                        ? "bg-amber-500/10 text-amber-400"
                        : user.role === "read"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-green-500/10 text-green-400"
                    }`}
                  >
                    {user.role === "admin"
                      ? t("users.roleAdmin")
                      : user.role === "read"
                      ? t("users.roleRead")
                      : t("users.roleEdit")}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(user)}
                    title={t("common.edit")}
                    className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    title={t("common.delete")}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <UserEditor
            user={userToEdit}
            isOpen={isAdding || !!userToEdit}
            onClose={handleCloseEditor}
            onSave={handleSave}
            isLoading={createMutation.isPending || updateUserMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
