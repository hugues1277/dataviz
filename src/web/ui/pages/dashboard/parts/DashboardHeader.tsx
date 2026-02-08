import React, { useState, useCallback, useMemo } from "react";
import { Check } from "lucide-react";
import { Dashboard } from "../../../../../shared/types/types";
import { useTranslation } from "react-i18next";
import DatePicker from "../widgets/DatePicker";
import DashboardActions from "../widgets/DashboardActions";
import { useDateRangeStore } from "../../../../core/stores/useDateRangeStore";
import { useDashboardsStore } from "../../../../core/stores/dashboardsStore";
import { useRefetchDashboardCharts } from "../../../../core/hooks/dashboard/useChartQuery";
import Header from "../../../components/layout/Header";
import { deleteDashboardUseCase } from "@/src/web/core/useCases/dashboards/deleteDashboardUseCase";
import { useNavigate } from "react-router";
import { renameDashboardUseCase } from "@/src/web/core/useCases/dashboards/renameDashboardUseCase";

interface DashboardHeaderProps {
  name: string;
  isLocked: boolean;
  activeDashboard?: Dashboard;
  canDeleteDashboard: boolean;
  setIsLocked: (locked: boolean) => void;
  onAddChart: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  name,
  isLocked,
  activeDashboard,
  canDeleteDashboard,
  setIsLocked,
  onAddChart,
}) => {
  const { t } = useTranslation();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const navigate = useNavigate();

  const { dateRange, setDateRange, isAllTime, setAllTime } =
    useDateRangeStore();
  const refetchDashboardCharts = useRefetchDashboardCharts();

  const handleRefresh = useCallback(() => {
    if (activeDashboard?.id) {
      refetchDashboardCharts();
    }
  }, [activeDashboard?.id, refetchDashboardCharts]);

  const handleStartRename = useCallback(() => {
    if (activeDashboard) {
      setTempTitle(activeDashboard.name);
      setIsEditingTitle(true);
    }
  }, [activeDashboard]);

  const handleFinishRename = useCallback(async () => {
    if (tempTitle.trim() && activeDashboard?.id) {
      await renameDashboardUseCase.execute(activeDashboard?.id, tempTitle);
      setIsEditingTitle(false);
    }
  }, [tempTitle, activeDashboard?.id]);

  const handleDeleteDashboard = useCallback(async () => {
    const id = activeDashboard?.id;
    if (!id || !canDeleteDashboard) return;

    const remainingDashboards = await deleteDashboardUseCase.execute(id);
    setTimeout(() => {
      navigate(`/dashboards/${remainingDashboards[0].id}`);
    }, 100);
  }, [navigate, activeDashboard, canDeleteDashboard]);

  if (!activeDashboard) return null;

  const titleContent =
    name === t("dashboard.title") ? (
      <>
        {isEditingTitle ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              className="bg-[#181b1f] border border-blue-500 rounded px-2 py-1 text-sm text-white outline-none w-32 sm:min-w-[200px]"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFinishRename()}
              onBlur={handleFinishRename}
            />
            <button onClick={handleFinishRename} className="p-1 text-blue-400">
              <Check size={16} />
            </button>
          </div>
        ) : (
          <h1 className="text-sm sm:text-lg font-bold text-white truncate max-w-[110px] sm:max-w-[300px] tracking-tight">
            {activeDashboard.name}
          </h1>
        )}
      </>
    ) : (
      <h1 className="text-sm sm:text-lg font-bold text-white truncate tracking-tight">
        {name}
      </h1>
    );

  return (
    <Header
      rightContent={
        <>
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <DatePicker
              dateRange={dateRange}
              setDateRange={(range) => setDateRange(range, activeDashboard?.id)}
              isAllTime={isAllTime}
              setAllTime={() => setAllTime()}
            />
            <DashboardActions
              activeDashboard={activeDashboard}
              canDeleteDashboard={canDeleteDashboard}
              isLocked={isLocked}
              setIsLocked={setIsLocked}
              onRefresh={handleRefresh}
              onAddChart={onAddChart}
              onRenameDashboard={handleStartRename}
              onDeleteDashboard={handleDeleteDashboard}
            />
          </div>
        </>
      }
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {titleContent}
      </div>
    </Header>
  );
};

export default DashboardHeader;
