import React, { useRef, useState, useCallback } from "react";
import { LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { AppDatas } from "../../../../shared/types/types";
import Header from "../../components/layout/Header";
import PageHeader from "../../components/layout/PageHeader";
import { useDialog } from "../../components/modal/DialogContext";
import { useTranslation } from "react-i18next";
import { dataManagementService } from "../../../core/services/dataManagementService";
import { useDashboardsStore } from "../../../core/stores/dashboardsStore";
import { useNavigate } from "react-router";
import { signOut, useSession } from "../../../providers/betterAuthWebClient";
import logger from "../../../../shared/utils/logger";
import { Button } from "../../components/Button";
import { SettingsActionCard } from "./parts/SettingsActionCard";
import { initConnectionsUseCase } from "@/src/web/core/useCases/connections/initConnectionsUseCase";

export enum LoadingOperation {
  Export = "export",
  ImportFile = "importFile",
  Reset = "reset",
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: session } = useSession();
  const {
    setDashboards,
    setAllCharts,
    setActiveDashboard: setSelectedDashboardId,
  } = useDashboardsStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingOperation, setLoadingOperation] =
    useState<LoadingOperation | null>(null);
  const { confirm } = useDialog();

  const handleExport = useCallback(async () => {
    setLoadingOperation(LoadingOperation.Export);
    try {
      await dataManagementService.exportData();
    } catch (error: unknown) {
      logger.error("handleExport", error);
      toast.error(t("settings.exportFailed"));
    } finally {
      setLoadingOperation(null);
    }
  }, [t]);

  const handleImport = useCallback(
    async (data: AppDatas) => {
      setLoadingOperation(LoadingOperation.ImportFile);
      try {
        const appDatas = await dataManagementService.importData({
          dashboards: data.dashboards,
          charts: data.charts,
          connections: data.connections,
        });
        await Promise.all([
          setDashboards(appDatas.dashboards),
          setAllCharts(appDatas.charts),
          initConnectionsUseCase(appDatas.connections),
        ]);

        toast.success(t("settings.importSuccess"));
        const firstDashboard = appDatas.dashboards[0];
        if (firstDashboard) {
          navigate(`/dashboards/${firstDashboard.id}`);
        } else {
          navigate("/");
        }
      } catch (error: unknown) {
        logger.error("handleImport", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erreur d'importation";
        toast.error(t("settings.importError"));
      } finally {
        setLoadingOperation(null);
      }
    },
    [setDashboards, setAllCharts, t, navigate]
  );

  const processImport = useCallback(
    (jsonStr: string) => {
      try {
        const data = JSON.parse(jsonStr);
        handleImport({
          dashboards: data.dashboards,
          charts: data.charts,
          connections: data.connections,
        });
      } catch (error: unknown) {
        logger.error("processImport", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erreur d'importation";
        toast.error(
          t("settings.importError", {
            error: errorMessage,
          })
        );
        setLoadingOperation(null);
      }
    },
    [handleImport, t]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processImport(content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = useCallback(async () => {
    try {
      setLoadingOperation(LoadingOperation.Reset);

      await dataManagementService.resetData();
      await Promise.all([
        setDashboards([]),
        setAllCharts([]),
        initConnectionsUseCase([]),
      ]);
      setSelectedDashboardId("default");
      toast.success(t("settings.resetSuccess"));
      navigate("/");
    } catch (error: unknown) {
      logger.error("handleReset", error);
      toast.error(t("settings.resetError"));
    } finally {
      setLoadingOperation(null);
    }
  }, [
    setDashboards,
    setAllCharts,
    setSelectedDashboardId,
    setLoadingOperation,
    t,
    navigate,
  ]);

  const handleFullResetRequest = useCallback(() => {
    confirm({
      title: t("settings.resetConfirmTitle"),
      description: t("settings.resetConfirmDesc"),
      type: "danger",
      confirmLabel: t("settings.resetBtn"),
      onConfirm: async () => {
        await handleReset();
      },
    });
  }, [confirm, t, handleReset]);

  const handleSignOut = useCallback(async () => {
    confirm({
      title: t("common.logoutConfirmTitle"),
      description: t("common.logoutConfirmDesc"),
      type: "info",
      confirmLabel: t("common.logoutConfirmBtn"),
      onConfirm: async () => {
        await signOut();
        navigate("/sign-in");
      },
    });
  }, [navigate, confirm, t]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header name={t("settings.pageTitle")} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
          <PageHeader
            title={t("settings.title")}
            description={t("settings.desc")}
            actions={
              session?.user && (
                <Button onClick={handleSignOut}>
                  <LogOut size={16} /> {t("common.logout")}
                </Button>
              )
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingsActionCard
              type="export"
              onAction={handleExport}
              isLoading={loadingOperation === LoadingOperation.Export}
            />
            <SettingsActionCard
              type="import"
              onAction={() => {}}
              onFileChange={handleFileChange}
              fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
              isLoading={loadingOperation === LoadingOperation.ImportFile}
            />
          </div>

          <SettingsActionCard
            type="reset"
            onAction={handleFullResetRequest}
            isLoading={loadingOperation === LoadingOperation.Reset}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
