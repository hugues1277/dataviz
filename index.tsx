import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import { DialogProvider } from "./src/web/ui/components/modal/DialogContext";
import { SidebarProvider } from "./src/web/core/context/useSidebar";
import "./src/i18n/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3600000, // 1 heure (équivalent à QUERY_CACHE_TTL)
      gcTime: 3600000, // 1 heure (anciennement cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Impossible de trouver l'élément racine pour le montage");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <SidebarProvider>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </SidebarProvider>
      </DialogProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
