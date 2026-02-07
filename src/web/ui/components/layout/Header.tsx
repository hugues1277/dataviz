import React from "react";
import { Menu } from "lucide-react";
import { useSidebar } from "../../../core/context/useSidebar";

interface HeaderProps {
  name?: string;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ name, children, rightContent }) => {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="h-14 border-b border-[#1f2127] flex items-center justify-between px-3 sm:px-4 bg-[#111217] z-50 shrink-0 select-none">
      <div className="flex items-center gap-2 overflow-hidden mr-2">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-[#181b1f] rounded transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 overflow-hidden">
          {children
            ? children
            : name && (
                <h1 className="text-sm sm:text-lg font-bold text-white truncate max-w-[110px] sm:max-w-[300px] tracking-tight">
                  {name}
                </h1>
              )}
        </div>
      </div>
      {rightContent}
    </header>
  );
};

export default Header;
