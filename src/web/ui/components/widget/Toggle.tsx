type ToggleProps = {
  label: string;
  className?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export default function Toggle({
  label,
  className,
  enabled,
  onChange,
}: ToggleProps) {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer select-none ${className}`}
      onClick={() => onChange(!enabled)}
    >
      <div
        className={`me-1 relative w-7 h-4 rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-gray-500 dark:bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-3 w-3 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-3" : ""
          }`}
        ></span>
      </div>

      <span>{label}</span>
    </label>
  );
}
