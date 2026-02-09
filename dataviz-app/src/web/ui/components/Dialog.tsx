
import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm?: () => void;
  onClose: () => void;
  isAlertOnly?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  type = 'info',
  onConfirm,
  onClose,
  isAlertOnly = false
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  
  const defaultConfirmLabel = confirmLabel || t("common.confirm");
  const defaultCancelLabel = cancelLabel || t("common.cancel");

  const themes = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      button: "bg-red-600 hover:bg-red-500 text-white",
      border: "border-red-500/20",
      bg: "bg-red-500/5"
    },
    warning: {
      icon: <AlertCircle className="text-orange-500" size={24} />,
      button: "bg-orange-600 hover:bg-orange-500 text-white",
      border: "border-orange-500/20",
      bg: "bg-orange-500/5"
    },
    success: {
      icon: <Check className="text-green-500" size={24} />,
      button: "bg-green-600 hover:bg-green-500 text-white",
      border: "border-green-500/20",
      bg: "bg-green-500/5"
    },
    info: {
      icon: <Info className="text-blue-500" size={24} />,
      button: "bg-blue-600 hover:bg-blue-500 text-white",
      border: "border-blue-500/20",
      bg: "bg-blue-500/5"
    }
  };

  const currentTheme = themes[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-[#111217] border ${currentTheme.border} w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className={`p-6 ${currentTheme.bg}`}>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#111217] rounded-xl border border-[#1f2127] shrink-0">
              {currentTheme.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[#1f2127] rounded-full text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-[#111217] border-t border-[#1f2127] flex justify-end gap-3">
          {!isAlertOnly && (
            <button 
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              {defaultCancelLabel}
            </button>
          )}
          <button 
            onClick={() => {
              if (onConfirm) onConfirm();
              if (isAlertOnly) onClose();
            }}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentTheme.button}`}
          >
            {isAlertOnly ? t("common.ok") : defaultConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
