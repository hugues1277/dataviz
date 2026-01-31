import "./style.css";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Sidebar from "./src/web/ui/components/layout/Sidebar";
import DashboardPage from "./src/web/ui/pages/dashboard/DashboardPage";
import ConnectionManager from "./src/web/ui/pages/connections/ConnectionPage";
import SettingsView from "./src/web/ui/pages/settings/SettingsPage";
import { SignInPage } from "./src/web/ui/pages/auth/SignInPage";
import { ProtectedRoute } from "./src/web/ui/components/auth/ProtectedRoute";
import { useStoresInit } from "./src/web/core/hooks/useStoresInit";
import { useDashboardsStore } from "./src/web/core/stores/dashboardsStore";
import { useTranslation } from "react-i18next";

const App: React.FC = () => {
  useStoresInit();

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-[#0b0e14]">
              <Sidebar />
              <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <Routes>
                    <Route path="/" element={<DefaultRedirect />} />
                    <Route
                      path="/dashboards/:dashboardId"
                      element={<DashboardPage />}
                    />
                    <Route
                      path="/connections"
                      element={<ConnectionManager />}
                    />
                    <Route path="/settings" element={<SettingsView />} />
                    <Route path="*" element={<DefaultRedirect />} />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const DefaultRedirect: React.FC = () => {
  const { dashboards, activeDashboard, isLoading } = useDashboardsStore();
  const { t } = useTranslation();

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

  const dashboardId = activeDashboard?.id || dashboards[0]?.id || "";
  return <Navigate to={`/dashboards/${dashboardId}`} replace />;
};

export default App;
