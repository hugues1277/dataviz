import React from "react";
import {
  DBConnection,
  CONNECTION_TYPES,
} from "../../../../../shared/types/types";
import {
  Database,
  Globe,
  HardDrive,
  Link2,
  Shield,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConnectionCardProps {
  connection: DBConnection;
  onEdit?: (connection: DBConnection) => void;
  onDelete?: (id: string, name: string) => void;
  onSetDefault?: (id: string) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-[#111217] border border-[#1f2127] rounded-3xl p-6 flex flex-col group hover:border-blue-500/50 transition-all shadow-lg relative overflow-hidden select-none">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 ${
            connection.type === CONNECTION_TYPES.API
              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
              : connection.type === CONNECTION_TYPES.MYSQL
              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
          } rounded-2xl flex items-center justify-center border`}
        >
          {connection.type === CONNECTION_TYPES.API ? (
            <Globe size={24} />
          ) : (
            <HardDrive size={24} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {onSetDefault && (
            <button
              onClick={() => onSetDefault(connection.id)}
              title={t("connections.setAsDefault")}
              className={`p-2 transition-all rounded-xl ${
                connection.isDefault
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-gray-600 hover:text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <Star
                size={18}
                className={connection.isDefault ? "fill-current" : ""}
              />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(connection)}
              className="p-2 text-gray-600 hover:text-blue-400 transition-all hover:bg-blue-500/10 rounded-xl"
            >
              <Edit size={18} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(connection.id, connection.name)}
              className="p-2 text-gray-600 hover:text-red-400 transition-all hover:bg-red-500/10 rounded-xl"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <h4 className="font-black text-white text-sm uppercase tracking-wider mb-2">
        {connection.name}
      </h4>

      <div className="space-y-2 h-[40px]">
        {connection.type === CONNECTION_TYPES.API ? (
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold truncate">
            <Link2 size={12} className="text-purple-500 shrink-0" />
            <span className="truncate">{connection.apiUrl}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold truncate">
              <Globe size={12} className="text-blue-500 shrink-0" />
              <span>
                {connection.host}:
                {connection.port ??
                  (connection.type === CONNECTION_TYPES.MYSQL ? 3306 : 5432)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold truncate">
              <Database size={12} className="text-blue-500 shrink-0" />
              <span>{connection.database}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[#1f2127] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-[8px] font-black uppercase px-2 py-1 rounded ${
              connection.type === CONNECTION_TYPES.API
                ? "bg-purple-500/10 text-purple-400"
                : connection.type === CONNECTION_TYPES.MYSQL
                ? "bg-orange-500/10 text-orange-400"
                : "bg-blue-500/10 text-blue-400"
            }`}
          >
            {connection.type === CONNECTION_TYPES.POSTGRES
              ? t("connections.postgresql")
              : connection.type === CONNECTION_TYPES.MYSQL
              ? t("connections.mysql")
              : connection.type}
          </span>
          {connection.isDefault && (
            <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-amber-500/10 text-amber-400">
              {t("connections.defaultConnection")}
            </span>
          )}
        </div>
        {connection.ssl ||
          (connection.type === CONNECTION_TYPES.API && (
            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-500/70">
              <Shield size={10} /> Secure
            </span>
          ))}
      </div>
    </div>
  );
};

export default ConnectionCard;
