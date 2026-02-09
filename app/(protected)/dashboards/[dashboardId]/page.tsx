"use client";

import React from "react";
import DashboardPage from "../../../../src/web/ui/pages/dashboard/DashboardPage";

export default function Dashboard({
  params,
}: {
  params: { dashboardId: string };
}) {
  return <DashboardPage />;
}
