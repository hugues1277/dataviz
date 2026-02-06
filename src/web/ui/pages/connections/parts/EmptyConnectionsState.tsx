import React from "react";
import { Database } from "lucide-react";
import { useTranslation } from "react-i18next";

const EmptyConnectionsState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="col-span-full text-center py-32 bg-[#111217] border border-[#1f2127] rounded-[3rem] border-dashed">
      <Database size={64} className="mx-auto mb-6 text-gray-800" />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
        {t("connections.none")}
      </p>
    </div>
  );
};

export default EmptyConnectionsState;
