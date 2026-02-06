import React, { useRef, useState, useCallback } from "react";
import {
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { AppDatas } from "../../../../shared/types/types";
import Header from "../../components/layout/Header";
import PageHeader from "../../components/layout/PageHeader";
import { useDialog } from "../../components/modal/DialogContext";
import { useTranslation } from "react-i18next";
import { dataManagementService } from "../../../core/services/dataManagementService";
import { useDashboardsStore } from "../../../core/stores/dashboardsStore";
import { useConnectionsStore } from "../../../core/stores/connectionsStore";
import { useNavigate } from "react-router";
import { signOut, useSession } from "../../../providers/betterAuthWebClient";
import logger from "../../../../shared/utils/logger";
import { Button } from "../../components/Button";

enum LoadingOperation {
  Export = "export",
  ImportFile = "importFile",
  Reset = "reset",
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm, showAlert } = useDialog();
  const {
    setDashboards,
    setAllCharts,
    setActiveDashboard: setSelectedDashboardId,
  } = useDashboardsStore();
  const { initConnections } = useConnectionsStore();
  const { data: session } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loadingOperation, setLoadingOperation] =
    useState<LoadingOperation | null>(null);

  const handleExport = useCallback(async () => {
    setLoadingOperation(LoadingOperation.Export);
    try {
      await dataManagementService.exportData();
      setStatus({ type: "success", message: t("settings.exportSuccess") });
    } catch (error: unknown) {
      logger.error("handleExport", error);
      setStatus({ type: "error", message: t("settings.exportFailed") });
      showAlert(
        t("settings.exportError"),
        error instanceof Error ? error.message : "Erreur d'exportation",
        "danger"
      );
    } finally {
      setLoadingOperation(null);
    }
  }, [t, showAlert]);

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
          initConnections(appDatas.connections),
        ]);
        setStatus({ type: "success", message: t("settings.importSuccess") });
        const firstDashboard = appDatas.dashboards[0];
        if (firstDashboard) {
          navigate(`/dashboards/${firstDashboard.id}`);
        } else {
          navigate("/");
        }
      } catch (error: unknown) {
        logger.error("handleImport", error);
        setStatus({
          type: "error",
          message: t("settings.importError", {
            error:
              error instanceof Error ? error.message : "Erreur d'importation",
          }),
        });
        showAlert(
          t("settings.importErrorTitle"),
          error instanceof Error ? error.message : "Erreur d'importation",
          "danger"
        );
      } finally {
        setLoadingOperation(null);
      }
    },
    [setDashboards, setAllCharts, initConnections, t, showAlert, navigate]
  );

  const handleReset = useCallback(async () => {
    try {
      await dataManagementService.resetData();
      await Promise.all([
        setDashboards([]),
        setAllCharts([]),
        initConnections([]),
      ]);
      setSelectedDashboardId("default");
      setStatus({ type: "success", message: t("settings.resetSuccess") });
      navigate("/");
    } catch (error: unknown) {
      logger.error("handleReset", error);
      setStatus({
        type: "error",
        message: t("settings.resetError", {
          error:
            error instanceof Error
              ? error.message
              : "Erreur de réinitialisation",
        }),
      });
      showAlert(
        t("settings.resetErrorTitle"),
        error instanceof Error ? error.message : "Erreur de réinitialisation",
        "danger"
      );
    }
  }, [
    setDashboards,
    setAllCharts,
    initConnections,
    setSelectedDashboardId,
    t,
    showAlert,
    navigate,
  ]);

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
        setStatus({
          type: "error",
          message: t("settings.importError", {
            error:
              error instanceof Error ? error.message : "Erreur d'importation",
          }),
        });
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

  const handleFullResetRequest = useCallback(() => {
    confirm({
      title: t("settings.resetConfirmTitle"),
      description: t("settings.resetConfirmDesc"),
      type: "danger",
      confirmLabel: t("settings.resetBtn"),
      onConfirm: async () => {
        setLoadingOperation(LoadingOperation.Reset);
        await handleReset();
        setLoadingOperation(null);
      },
    });
  }, [confirm, t, handleReset, setLoadingOperation]);

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

          {status && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between border ${
                status.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {status.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
                <span className="text-sm font-medium">{status.message}</span>
              </div>
              <button
                onClick={() => setStatus(null)}
                className="text-xs font-bold uppercase opacity-50"
              >
                {t("common.ok")}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111217] border border-[#1f2127] rounded-4xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 mb-6">
                <Download size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t("settings.export")}
              </h3>
              <p className="text-xs text-gray-500 mb-8">
                {t("settings.exportDesc")}
              </p>
              <Button
                onClick={handleExport}
                disabled={loadingOperation === LoadingOperation.Export}
                className="w-full bg-[#181b1f]"
              >
                {loadingOperation === LoadingOperation.Export ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("settings.downloadJson")
                )}
              </Button>
            </div>

            <div className="bg-[#111217] border border-[#1f2127] rounded-4xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-600/10 rounded-3xl flex items-center justify-center text-green-500 mb-6">
                <Upload size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t("settings.import")}
              </h3>
              <p className="text-xs text-gray-500 mb-8">
                {t("settings.importDesc")}
              </p>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingOperation === LoadingOperation.ImportFile}
                className="w-full bg-green-600/10 hover:bg-green-600"
              >
                {loadingOperation === LoadingOperation.ImportFile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("settings.fileJson")
                )}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          <div className="bg-[#111217] border border-[#1f2127] rounded-4xl p-8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t("settings.resetTitle")}
              </h3>
              <p className="text-xs text-gray-500">{t("settings.resetDesc")}</p>
            </div>
            <Button
              onClick={handleFullResetRequest}
              disabled={loadingOperation === LoadingOperation.Reset}
              className="hover:bg-red-600"
            >
              {t("settings.resetBtn")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
