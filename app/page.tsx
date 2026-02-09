"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardsStore } from "../src/web/core/stores/dashboardsStore";
import { useTranslation } from "react-i18next";

export default function Home() {
  const router = useRouter();
  const { dashboards, activeDashboard, isLoading } = useDashboardsStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoading) return;

    const dashboardId = activeDashboard?.id || dashboards[0]?.id || "";
    console.log(dashboardId);
    if (dashboardId) {
      router.replace(`/dashboards/${dashboardId}`);
    }
  }, [isLoading, activeDashboard, dashboards, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  return null;
}
