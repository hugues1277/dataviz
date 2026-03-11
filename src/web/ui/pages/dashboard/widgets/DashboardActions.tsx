import React, { useCallback } from "react";
import {
  Plus,
  Lock,
  Unlock,
  MoreVertical,
  Edit3,
  Trash2,
} from "lucide-react";
import { RefreshIconButton } from "../../../components/RefreshIconButton";
import { Dashboard } from "../../../../../shared/types/types";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "../../../components/modal/DialogContext";

interface DashboardActionsProps {
  activeDashboard?: Dashboard;
  canDeleteDashboard: boolean;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  onRefresh: () => void;
  onAddChart: () => void;
  onRenameDashboard: () => void;
  onDeleteDashboard: () => void;
  onCloseDropdown?: () => void;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({
  activeDashboard,
  canDeleteDashboard,
  isLocked,
  setIsLocked,
  onRefresh,
  onAddChart,
  onRenameDashboard,
  onCloseDropdown,
  onDeleteDashboard,
}) => {
  const { t } = useTranslation();
  const { confirm, showAlert } = useDialog();

  const handleRefreshClick = useCallback(() => {
    onRefresh();
    onCloseDropdown?.();
  }, [onRefresh, onCloseDropdown]);

  const handleDeleteDashboard = useCallback(async () => {
    if (!activeDashboard) return;

    if (!canDeleteDashboard) {
      showAlert(
        t("dashboard.actionImpossible"),
        t("dashboard.cannotDeleteLast"),
        "warning"
      );
      return;
    }
    confirm({
      title: t("dashboard.deleteConfirmTitle"),
      description: t("dashboard.deleteConfirmDesc", {
        name: activeDashboard.name,
      }),
      type: "danger",
      confirmLabel: t("common.delete"),
      onConfirm: async () => onDeleteDashboard(),
    });
  }, [
    activeDashboard,
    canDeleteDashboard,
    onDeleteDashboard,
    confirm,
    showAlert,
    t,
  ]);

  return (
    <div className="hidden lg:flex items-center gap-2 shrink-0">
      {/* Bouton Refresh */}
      <RefreshIconButton
        onClick={handleRefreshClick}
        size={18}
        title={t("header.refreshTip")}
        className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-[#181b1f] transition-colors"
      />
      {!isLocked && (
        <button
          onClick={() => {
            setIsLocked(!isLocked);
            onCloseDropdown?.();
          }}
          title={t("common.unlock")}
          className="p-2 rounded-lg hover:text-white hover:bg-[#181b1f] transition-colors text-orange-400"
        >
          <Unlock size={14} />
        </button>
      )}

      {/* Dropdown Menu pour toutes les autres actions */}
      {activeDashboard && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#181b1f] transition-colors">
              <MoreVertical size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border-[#2c3235] bg-[#181b1f] rounded-xl shadow-2xl"
          >
            <DropdownMenuItem
              onClick={() => {
                onAddChart();
                onCloseDropdown?.();
              }}
              className="focus:bg-white/10 rounded-lg"
            >
              <Plus className="mr-2" />
              {t("header.newchart")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsLocked(!isLocked);
                onCloseDropdown?.();
              }}
              className={`${
                isLocked ? "" : "text-orange-400"
              } focus:bg-white/10 rounded-lg`}
            >
              {isLocked ? (
                <Lock className="mr-2" />
              ) : (
                <Unlock className="mr-2" />
              )}
              {isLocked ? t("common.unlock") : t("common.locked")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onRenameDashboard();
                onCloseDropdown?.();
              }}
              className="focus:bg-white/10 rounded-lg"
            >
              <Edit3 className="mr-2" />
              {t("common.rename")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                handleDeleteDashboard();
                onCloseDropdown?.();
              }}
              className="text-red-500 focus:bg-white/10 rounded-lg"
            >
              <Trash2 className="mr-2" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default DashboardActions;
