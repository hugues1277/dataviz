import React, { createContext, use, useState, useCallback } from "react";
import Dialog from "../Dialog";

interface DialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info" | "success";
  onConfirm?: () => void;
  isAlertOnly?: boolean;
}

interface DialogContextType {
  confirm: (options: DialogOptions) => void;
  showAlert: (
    title: string,
    description: string,
    type?: "info" | "warning" | "danger"
  ) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<DialogOptions & { isOpen: boolean }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
  });

  const confirm = useCallback((options: DialogOptions) => {
    setConfig({ ...options, isOpen: true });
  }, []);

  const showAlert = useCallback(
    (
      title: string,
      description: string,
      type: "info" | "warning" | "danger" = "info"
    ) => {
      setConfig({
        title,
        description,
        type,
        isOpen: true,
        isAlertOnly: true,
      });
    },
    []
  );

  const handleClose = () => {
    setConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (config.onConfirm) config.onConfirm();
    handleClose();
  };

  return (
    <DialogContext value={{ confirm, showAlert }}>
      {children}
      <Dialog {...config} onClose={handleClose} onConfirm={handleConfirm} />
    </DialogContext>
  );
};

export const useDialog = () => {
  const context = use(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
