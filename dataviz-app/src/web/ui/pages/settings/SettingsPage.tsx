import React, { useRef, useState, useCallback, useEffect } from "react";
import { LogOut } from "lucide-react";
import Header from "../../components/layout/Header";
import PageHeader from "../../components/layout/PageHeader";
import { useDialog } from "../../components/modal/DialogContext";
import { useTranslation } from "react-i18next";
"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "../../../providers/betterAuthWebClient";
import { Button } from "../../components/Button";
import { SettingsActionCard } from "./parts/SettingsActionCard";
import { exportDataUseCase } from "../../../core/useCases/dataManagement/exportDataUseCase";
import { importDataUseCase } from "../../../core/useCases/dataManagement/importDataUseCase";
import { resetDataUseCase } from "../../../core/useCases/dataManagement/resetDataUseCase";
import i18n, { LANGUAGES } from "../../../../i18n/i18n";

export enum LoadingOperation {
  Export = "export",
  ImportFile = "importFile",
  Reset = "reset",
}

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { t, i18n: i18nInstance } = useTranslation();
  const { data: session } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingOperation, setLoadingOperation] =
    useState<LoadingOperation | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language);
  const { confirm } = useDialog();

  // Synchroniser l'état avec les changements de langue
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };
    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

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
        router.push(`/dashboards/${appDatas.dashboards[0].id}`);
      }
    },
    [router]
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
      router.push("/");
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
        router.push("/sign-in");
      },
    });
  }, [router, confirm, t]);

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
              isLoading={loadingOperation === LoadingOperation.Export}
            >
              <Button
                onClick={handleExport}
                isLoading={loadingOperation === LoadingOperation.Export}
                className="w-full"
              >
                {t("settings.downloadJson")}
              </Button>
            </SettingsActionCard>
            <SettingsActionCard
              type="import"
              isLoading={loadingOperation === LoadingOperation.ImportFile}
            >
              <Button
                onClick={() => fileInputRef.current?.click()}
                isLoading={loadingOperation === LoadingOperation.ImportFile}
                className="w-full hover:bg-green-600"
              >
                {t("settings.fileJson")}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </SettingsActionCard>

            <SettingsActionCard type="language" isLoading={false}>
              <select
                className="w-full text-white appearance-none outline-none text-center py-3 px-6 lg:px-6 lg:py-3 border border-[#2c3235] hover:bg-purple-500 rounded-2xl text-xs font-black uppercase tracking-widest"
                value={currentLanguage}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                {LANGUAGES.map((language) => (
                  <option key={language} value={language}>
                    {t(`language.${language}`)}
                  </option>
                ))}
              </select>
            </SettingsActionCard>

            <SettingsActionCard
              type="reset"
              isLoading={loadingOperation === LoadingOperation.Reset}
            >
              <Button
                onClick={handleFullResetRequest}
                isLoading={loadingOperation === LoadingOperation.Reset}
                className="w-full hover:bg-red-600"
              >
                {t("settings.resetBtn")}
              </Button>
            </SettingsActionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
