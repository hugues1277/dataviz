import React, { useRef, useState, useCallback } from "react";
import {
  Download,
  Upload,
  ClipboardPaste,
  Send,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AppDatas } from "../../../../shared/types/types";
import Header from "../../components/layout/Header";
import { useDialog } from "../../components/modal/DialogContext";
import { useTranslation } from "react-i18next";
import { dataManagementService } from "../../../core/services/dataManagementService";
import { useConnectionsStore } from "../../../core/stores/connectionsStore";
import { useNavigate } from "react-router";
import { signOut, useSession } from "../../../providers/auth/authProvider";
import logger from "../../../../shared/utils/logger";
import { initDashboards } from "../../../core/useCases/dashboards/initDashboards";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm, showAlert } = useDialog();
  const { initConnections } = useConnectionsStore();
  const { data: session } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pastedJson, setPastedJson] = useState("");

  const handleExport = useCallback(async () => {
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
    }
  }, [t, showAlert]);

  const handleImport = useCallback(
    async (data: AppDatas) => {
      try {
        const appDatas = await dataManagementService.importData({
          dashboards: data.dashboards,
          charts: data.charts,
          connections: data.connections,
        });
        await Promise.all([
          initDashboards(appDatas.dashboards, appDatas.charts),
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
      }
    },
    [initDashboards, initConnections, t, showAlert, navigate]
  );

  const handleReset = useCallback(async () => {
    try {
      await dataManagementService.resetData();
      await Promise.all([initDashboards([], []), initConnections([])]);
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
  }, [initDashboards, initConnections, t, showAlert, navigate]);

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
      onConfirm: () => {
        handleReset();
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
      <Header
        name={t("settings.pageTitle")}
        rightContent={
          session?.user && (
            <button
              onClick={handleSignOut}
              className="px-6 py-2 hover:bg-blue-600 text-white hover:text-white border border-white-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {t("common.logout")}
            </button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {t("settings.title")}
            </h2>
            <p className="text-gray-500 text-sm">{t("settings.desc")}</p>
          </div>

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
              <button
                onClick={handleExport}
                className="w-full py-3 bg-[#181b1f] border border-[#2c3235] hover:border-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {t("settings.downloadJson")}
              </button>
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

              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-green-600/10 border border-green-500/20 hover:bg-green-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {t("settings.fileJson")}
                </button>
                <button
                  onClick={() => setShowPaste(!showPaste)}
                  className="w-full py-3 bg-[#181b1f] border border-[#2c3235] hover:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ClipboardPaste size={12} />{" "}
                  {showPaste
                    ? t("settings.closeEditor")
                    : t("settings.pasteJson")}
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {showPaste && (
            <div className="bg-[#111217] border border-[#1f2127] rounded-4xl p-8 animate-in slide-in-from-bottom-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                {t("settings.jsonLabel")}
              </label>
              <textarea
                className="w-full h-48 bg-[#0b0e14] border border-[#1f2127] rounded-xl p-4 font-mono text-xs text-blue-300 outline-none focus:ring-1 focus:ring-blue-500 mb-4"
                placeholder={t("settings.jsonPlaceholder")}
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
              />
              <button
                onClick={() => {
                  if (pastedJson.trim()) processImport(pastedJson);
                }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
              >
                <Send size={16} /> {t("settings.applyImport")}
              </button>
            </div>
          )}

          <div className="bg-red-500/5 border border-red-500/10 rounded-4xl p-8 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-red-400">
                {t("settings.resetTitle")}
              </h3>
              <p className="text-xs text-red-500/60 font-medium">
                {t("settings.resetDesc")}
              </p>
            </div>
            <button
              onClick={handleFullResetRequest}
              className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {t("settings.resetBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
