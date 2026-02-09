"use client";

import React, { useState, useCallback } from "react";
import {
  LayoutDashboard,
  Database,
  Settings,
  Plus,
  ChevronRight,
  X,
  ArrowUp,
  ArrowDown,
  ListOrdered,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../../../core/context/useSidebar";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useDashboardsStore } from "../../../core/stores/dashboardsStore";
import Image from "next/image";
import { moveDashboardUseCase } from "@/src/web/core/useCases/dashboards/moveDashboardUseCase";
import { addDashboardUseCase } from "@/src/web/core/useCases/dashboards/addDashboardUseCase";

const Sidebar: React.FC = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { dashboards, activeDashboard } = useDashboardsStore();

  const [reorderMode, setReorderMode] = useState(false);

  const getActiveView = (): "dashboards" | "connections" | "settings" => {
    if (pathname?.startsWith("/connections")) return "connections";
    if (pathname?.startsWith("/settings")) return "settings";
    return "dashboards";
  };

  const activeView = getActiveView();

  const handleToggleReorder = useCallback(() => {
    setReorderMode((prev) => !prev);
  }, []);

  const handleSelectDashboard = useCallback(
    (id: string) => {
      if (!reorderMode) {
        router.push(`/dashboards/${id}`);
        closeSidebar();
      }
    },
    [reorderMode, router, closeSidebar]
  );

  const handleMoveUp = useCallback((id: string) => {
    moveDashboardUseCase.execute(id, "up");
  }, []);

  const handleMoveDown = useCallback((id: string) => {
    moveDashboardUseCase.execute(id, "down");
  }, []);

  const handleAddDashboard = useCallback(async () => {
    const newId = await addDashboardUseCase.execute();
    // Attendre que le store se mette à jour avec le nouveau dashboard
    setTimeout(() => {
      router.push(`/dashboards/${newId}`);
    }, 50);
    closeSidebar();
  }, [router, closeSidebar]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <aside className="w-64 lg:w-56 bg-[#111217] border-r border-[#1f2127] flex flex-col h-full select-none shadow-2xl lg:shadow-none">
          <div className="p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded flex items-center justify-center shadow-lg">
                <Image
                  src="/assets/logo.png"
                  alt="logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-lg pt-[2px] font-black text-white tracking-tighter uppercase">
                {t("common.appName")}
              </span>
            </div>

            <button
              onClick={closeSidebar}
              className="lg:hidden p-1 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-4 overflow-y-auto pt-2 scrollbar-none">
            <div className="space-y-0.5">
              <Link
                href={
                  activeDashboard?.id
                    ? `/dashboards/${activeDashboard?.id}`
                    : "/"
                }
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-colors ${
                  activeView === "dashboards"
                    ? "bg-[#181b1f] text-blue-400"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                <LayoutDashboard size={14} />
                <span className="uppercase tracking-widest">
                  {t("sidebar.dashboards")}
                </span>
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
                  {t("sidebar.myViews")}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleToggleReorder}
                    className={`p-1 rounded transition-colors ${
                      reorderMode
                        ? "text-blue-400 bg-blue-400/10"
                        : "text-gray-600 hover:text-gray-400"
                    }`}
                    title={t("common.reorder")}
                  >
                    <ListOrdered size={12} />
                  </button>
                  <button
                    onClick={handleAddDashboard}
                    className="p-1 text-gray-600 hover:text-blue-400"
                    title={t("sidebar.newDashboard")}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <div className="space-y-0.5">
                {dashboards.map((dash, index) => (
                  <div
                    key={dash.id}
                    className="flex items-center group relative"
                  >
                    <button
                      onClick={() => handleSelectDashboard(dash.id)}
                      className={`flex-1 flex items-center justify-between px-3 py-2.5 lg:py-1.5 rounded text-[11px] font-medium transition-all ${
                        reorderMode ? "cursor-default" : "cursor-pointer"
                      } ${
                        activeDashboard?.id === dash.id &&
                        activeView === "dashboards"
                          ? "bg-[#1a1c26] text-blue-100"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      <span className="truncate max-w-[160px] lg:max-w-[120px]">
                        {dash.name}
                      </span>
                      {!reorderMode && (
                        <ChevronRight
                          size={10}
                          className={`opacity-0 group-hover:opacity-100 ${
                            activeDashboard?.id === dash.id ? "opacity-100" : ""
                          }`}
                        />
                      )}
                    </button>

                    {reorderMode && (
                      <div className="flex items-center gap-0.5 pr-1 animate-in slide-in-from-right-2">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveUp(dash.id)}
                          className={`p-1 rounded transition-colors ${
                            index === 0
                              ? "text-gray-800"
                              : "text-gray-500 hover:text-blue-400 hover:bg-blue-400/5"
                          }`}
                        >
                          <ArrowUp size={10} />
                        </button>
                        <button
                          disabled={index === dashboards.length - 1}
                          onClick={() => handleMoveDown(dash.id)}
                          className={`p-1 rounded transition-colors ${
                            index === dashboards.length - 1
                              ? "text-gray-800"
                              : "text-gray-500 hover:text-blue-400 hover:bg-blue-400/5"
                          }`}
                        >
                          <ArrowDown size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>

          <div className="p-3 border-t border-[#1f2127] space-y-0.5">
            <Link
              href="/connections"
              onClick={() => closeSidebar()}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-colors ${
                activeView === "connections"
                  ? "bg-[#181b1f] text-blue-400"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <Database size={14} />
              <span className="uppercase tracking-widest">
                {t("sidebar.connections")}
              </span>
            </Link>
            <Link
              href="/settings"
              onClick={() => closeSidebar()}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-colors ${
                activeView === "settings"
                  ? "bg-[#181b1f] text-blue-400"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <Settings size={14} />
              <span className="uppercase tracking-widest">
                {t("sidebar.settings")}
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
};

export default React.memo(Sidebar);
