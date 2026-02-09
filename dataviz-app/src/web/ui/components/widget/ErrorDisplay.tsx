import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center h-full text-red-400 bg-red-500/5 rounded p-2 text-center ${className}`}
    >
      <AlertCircle size={14} className="mb-1" />
      <p className="text-[8px] font-mono leading-tight truncate w-full">
        {error}
      </p>
    </div>
  );
};
