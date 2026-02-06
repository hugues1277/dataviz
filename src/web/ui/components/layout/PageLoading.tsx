import { useTranslation } from "react-i18next";

const PageLoading: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold uppercase tracking-widest animate-pulse">
        {t("common.loading")}
      </p>
    </div>
  );
};

export default PageLoading;
