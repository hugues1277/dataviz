import React, { createContext, use, useState, useCallback } from "react";

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  );

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <SidebarContext value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext>
  );
};

export const useSidebar = () => {
  const context = use(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

