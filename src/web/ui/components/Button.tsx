import React from "react";
import { cn } from "../../core/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const baseStyles =
      "py-3 px-6 lg:px-6 lg:py-3 border border-[#2c3235] hover:bg-blue-500 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#181b1f] disabled:hover:border-[#2c3235]";

    return (
      <button ref={ref} className={cn(baseStyles, className)} {...props} />
    );
  }
);

Button.displayName = "Button";

export { Button };
