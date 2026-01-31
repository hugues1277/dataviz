import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { DialogProvider } from "./src/web/ui/components/modal/DialogContext";
import { SidebarProvider } from "./src/web/core/context/useSidebar";
import "./src/i18n/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3600000, // 1 hour (equivalent to QUERY_CACHE_TTL)
      gcTime: 3600000, // 1 hour (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </DialogProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
