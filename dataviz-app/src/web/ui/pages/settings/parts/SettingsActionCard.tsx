import React from "react";
import { Download, Upload, Globe, LucideIcon, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/Button";

type ActionType = "export" | "import" | "reset" | "language";

interface SettingsActionCardProps {
  type: ActionType;
  isLoading: boolean;
  children?: React.ReactNode;
}

const actionConfig: Record<
  ActionType,
  {
    icon: LucideIcon;
    iconColor: string;
    iconBgColor: string;
    titleKey: string;
    descKey: string;
    buttonTextKey: string;
    buttonClassName: string;
    layout: "centered" | "horizontal";
    showIcon: boolean;
  }
> = {
  export: {
    icon: Download,
    iconColor: "text-blue-500",
    iconBgColor: "bg-blue-600/10",
    titleKey: "settings.export",
    descKey: "settings.exportDesc",
    buttonTextKey: "settings.downloadJson",
    buttonClassName: "w-full bg-[#181b1f]",
    layout: "centered",
    showIcon: true,
  },
  import: {
    icon: Upload,
    iconColor: "text-green-500",
    iconBgColor: "bg-green-600/10",
    titleKey: "settings.import",
    descKey: "settings.importDesc",
    buttonTextKey: "settings.fileJson",
    buttonClassName: "w-full bg-green-600/10 hover:bg-green-600",
    layout: "centered",
    showIcon: true,
  },
  reset: {
    icon: Trash,
    iconColor: "text-red-500",
    iconBgColor: "bg-red-600/10",
    titleKey: "settings.resetTitle",
    descKey: "settings.resetDesc",
    buttonTextKey: "settings.resetBtn",
    buttonClassName: "w-full bg-red-600/10 hover:bg-red-600",
    layout: "centered",
    showIcon: true,
  },
  language: {
    icon: Globe,
    iconColor: "text-purple-500",
    iconBgColor: "bg-purple-600/10",
    titleKey: "language.title",
    descKey: "language.description",
    buttonTextKey: "",
    buttonClassName: "w-full bg-[#181b1f]",
    layout: "centered",
    showIcon: true,
  },
};

export const SettingsActionCard: React.FC<SettingsActionCardProps> = ({
  type,
  isLoading,
  children,
}) => {
  const { t } = useTranslation();
  const config = actionConfig[type];
  const Icon = config.icon;

  if (config.layout === "horizontal") {
    return (
      <div className="bg-[#111217] border border-[#1f2127] rounded-3xl p-6 flex items-center justify-between hover:border-blue-500/50 transition-all shadow-lg relative overflow-hidden select-none">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">
            {t(config.titleKey)}
          </h3>
          <p className="text-xs text-gray-500">{t(config.descKey)}</p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="bg-[#111217] border border-[#1f2127] rounded-3xl p-6 flex flex-col items-center text-center hover:border-blue-500/50 transition-all shadow-lg relative overflow-hidden select-none">
      {config.showIcon && (
        <div
          className={`w-16 h-16 ${config.iconBgColor} rounded-3xl flex items-center justify-center ${config.iconColor} mb-6`}
        >
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-2">
        {t(config.titleKey)}
      </h3>
      <p className="text-xs text-gray-500 mb-8">{t(config.descKey)}</p>
      {children}
    </div>
  );
};
