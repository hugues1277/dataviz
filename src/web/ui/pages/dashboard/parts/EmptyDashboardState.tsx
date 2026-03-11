"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Database, Plus } from "lucide-react";
import { Button } from "../../../components/Button";
import { useConnectionsStore } from "@/src/web/core/stores/connectionsStore";

interface EmptyDashboardStateProps {
  onAddChart: () => void;
  canEdit?: boolean;
}

const EmptyDashboardState: React.FC<EmptyDashboardStateProps> = ({
  onAddChart,
  canEdit = true,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { connections } = useConnectionsStore();

  return (
    <div className="flex flex-col gap-5 items-center justify-center h-[60vh] text-center p-8">
      <div className="w-16 h-16 bg-[#181b1f] rounded-full flex items-center justify-center border border-[#2c3235]">
        <Plus size={24} className="text-gray-600" />
      </div>
      {connections && connections.length > 0 ? (
        <>
          <h2 className="text-lg font-bold text-white mb-2 max-w-sm">
            {t("dashboard.noCharts")}
          </h2>
          {canEdit && (
            <Button
              onClick={onAddChart}
              variant="primary"
              icon={<Plus size={16} />}
            >
              {t("dashboard.newChart")}
            </Button>
          )}
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-white mb-2 max-w-sm">
            {t("dashboard.noConnections")}
          </h2>
          <Button
            onClick={() => router.push("/connections")}
            variant="primary"
            icon={<Database size={16} />}
          >
            {t("dashboard.addConnection")}
          </Button>
        </>
      )}
    </div>
  );
};

export default EmptyDashboardState;
