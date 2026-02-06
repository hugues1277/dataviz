import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-b-2",
  md: "w-6 h-6 border-b-2",
  lg: "w-8 h-8 border-b-4",
  xl: "w-10 h-10 border-b-4",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  return (
    <div
      className={`${className} ${sizeClasses[size]} animate-spin rounded-full border-blue-500 border-t-transparent`}
    />
  );
};
