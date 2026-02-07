import React from "react";
import { cn } from "../../core/utils/cn";
import { LoadingSpinner } from "./widget/LoadingSpinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "secondary";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, isLoading, icon, variant = "default", ...props }, ref) => {
    const color =
      variant === "primary"
        ? "bg-blue-600 hover:bg-blue-500 text-white"
        : variant === "secondary"
        ? "bg-gray-500 hover:bg-gray-400 text-white"
        : "";

    const baseStyles =
      "group py-3 px-6 lg:px-6 lg:py-3 border border-[#2c3235] hover:bg-blue-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#181b1f] disabled:hover:border-[#2c3235]";

    return (
      <button
        ref={ref}
        className={cn(baseStyles, color, className)}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" className=" group-hover:border-white" />
        ) : (
          icon && icon
        )}
        {props.children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
