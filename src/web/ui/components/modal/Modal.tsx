import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  icon: React.ReactNode;
  onClose: () => void;
  header?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  description,
  icon,
  onClose,
  header,
  children,
  actions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 lg:p-3 animate-in fade-in duration-300">
      <div className="bg-[#111217] w-full max-w-[1400px] h-full lg:h-[94vh] lg:rounded-xl border border-[#1f2127] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#1f2127] flex items-center justify-between bg-[#111217] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-500/20 text-blue-500 shrink-0">
              {icon}
            </div>
            <div className="truncate">
              <h2 className="font-black text-white uppercase tracking-[0.05em] text-xs sm:text-base truncate">
                {title}
              </h2>
              <p className="hidden sm:block text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 opacity-60">
                {description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {header && (
              <>
                {header}
                <div className="w-px h-5 bg-[#1f2127] mx-1.5" />
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/10 rounded-full transition-all text-gray-500 hover:text-red-500 border border-transparent hover:border-red-500/20 shadow-lg active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {children}
        {actions && (
          <div className="px-4 py-2.5 border-t border-[#1f2127] flex items-center justify-end bg-[#111217] shrink-0 gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
