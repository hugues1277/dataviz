import React, { useRef, useState, useCallback } from "react";
import { LogOut } from "lucide-react";
import Header from "../../components/layout/Header";
import PageHeader from "../../components/layout/PageHeader";
import { useDialog } from "../../components/modal/DialogContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { signOut, useSession } from "../../../providers/betterAuthWebClient";
import { Button } from "../../components/Button";
import { SettingsActionCard } from "./parts/SettingsActionCard";
import { exportDataUseCase } from "../../../core/useCases/dataManagement/exportDataUseCase";
import { importDataUseCase } from "../../../core/useCases/dataManagement/importDataUseCase";
import { resetDataUseCase } from "../../../core/useCases/dataManagement/resetDataUseCase";

export enum LoadingOperation {
  Export = "export",
  ImportFile = "importFile",
  Reset = "reset",
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: session } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingOperation, setLoadingOperation] =
    useState<LoadingOperation | null>(null);
  const { confirm } = useDialog();

  const handleExport = useCallback(async () => {
    setLoadingOperation(LoadingOperation.Export);
    await exportDataUseCase.execute();
    setLoadingOperation(null);
  }, [t]);

  const handleImport = useCallback(
    async (jsonStr: string) => {
      setLoadingOperation(LoadingOperation.ImportFile);
      const data = JSON.parse(jsonStr);
      const appDatas = await importDataUseCase.execute({
        dashboards: data.dashboards,
        charts: data.charts,
        connections: data.connections,
      });
      setLoadingOperation(null);

      if (appDatas && appDatas.dashboards.length > 0) {
        navigate(`/dashboards/${appDatas.dashboards[0].id}`);
      }
    },
    [navigate]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleImport(content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = useCallback(async () => {
    setLoadingOperation(LoadingOperation.Reset);
    const success = await resetDataUseCase.execute();
    setLoadingOperation(null);

    if (success) {
      navigate("/");
    }
  }, [navigate]);

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

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-6">
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
