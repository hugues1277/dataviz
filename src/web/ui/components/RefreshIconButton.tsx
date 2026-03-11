import React, { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "../../core/utils/cn";

export interface RefreshIconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  size?: number;
  loading?: boolean;
  className?: string;
}

const RefreshIconButton = React.forwardRef<
  HTMLButtonElement,
  RefreshIconButtonProps
>(({ size = 18, loading = false, onClick, className, ...props }, ref) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!loading) {
        setIsSpinning(false);
        requestAnimationFrame(() => setIsSpinning(true));
      }
      onClick?.(e);
    },
    [onClick, loading]
  );

  const iconClassName = loading
    ? "animate-spin"
    : isSpinning
      ? "animate-spin-once"
      : "";

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      onAnimationEnd={() => setIsSpinning(false)}
      className={cn(className)}
      {...props}
    >
      <RefreshCw size={size} className={iconClassName} />
    </button>
  );
});

RefreshIconButton.displayName = "RefreshIconButton";

export { RefreshIconButton };
