"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import Modal from "../../../components/modal/Modal";
import { Button } from "../../../components/Button";
import type { AppUser, UserRole } from "../UsersPage";

interface UserEditorProps {
  /** Mode ajout : user = null. Mode édition : user défini */
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    email?: string;
    password?: string;
    name?: string;
    role?: UserRole;
  }) => Promise<void>;
  isLoading?: boolean;
}

const UserEditor: React.FC<UserEditorProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const isEdit = !!user;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("edit");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setName(user.name || "");
      setRole((user.role as UserRole) || "edit");
      setPassword("");
    } else {
      setEmail("");
      setPassword("");
      setName("");
      setRole("edit");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      const data: { name?: string; email?: string; role?: UserRole; password?: string } = {};
      if (name) data.name = name;
      if (email) data.email = email;
      data.role = role;
      if (password && password.length >= 8) data.password = password;
      await onSave(data);
    } else {
      if (!email || !password) return;
      await onSave({
        email,
        password,
        name: name || email.split("@")[0],
        role,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setName("");
    setRole("edit");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={isEdit ? t("users.editUser") : t("users.addUser")}
      description={isEdit ? user?.email : t("users.addUserDesc")}
      icon={<Users size={16} />}
      onClose={handleClose}
      compact
      actions={
        <>
          <Button onClick={handleClose} variant="secondary">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            isLoading={isLoading}
            disabled={
              isEdit
                ? false
                : !email || !password || password.length < 8
            }
          >
            {t("common.save")}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            {t("auth.email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPlaceholder")}
            className="w-full px-4 py-2.5 bg-[#181b1f] border border-[#2c3235] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            {isEdit ? t("users.resetPassword") : t("auth.password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? t("users.resetPasswordPlaceholder") : t("auth.passwordPlaceholder")}
            className="w-full px-4 py-2.5 bg-[#181b1f] border border-[#2c3235] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            required={!isEdit}
            minLength={isEdit ? 0 : 8}
          />
          {isEdit ? (
            <p className="text-[9px] text-gray-500 mt-1">{t("users.resetPasswordHint")}</p>
          ) : (
            <p className="text-[9px] text-gray-500 mt-1">{t("auth.passwordMinLength")}</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            {t("auth.name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("auth.namePlaceholder")}
            className="w-full px-4 py-2.5 bg-[#181b1f] border border-[#2c3235] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            {t("users.role")}
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-4 py-2.5 bg-[#181b1f] border border-[#2c3235] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="read">{t("users.roleRead")}</option>
            <option value="edit">{t("users.roleEdit")}</option>
            <option value="admin">{t("users.roleAdmin")}</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default UserEditor;
