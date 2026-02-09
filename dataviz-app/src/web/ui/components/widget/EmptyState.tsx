import React from "react";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
      {icon || <AlertCircle size={24} className="mb-2 opacity-20" />}
      {title && (
        <p className="text-[10px] text-center uppercase font-bold tracking-widest mb-1">
          {title}
        </p>
      )}
      {message && (
        <p className="text-[8px] text-center opacity-60">{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
