import React, { useState } from "react";
import { DBConnection } from "../../../../shared/types/types";
import Header from "../../components/layout/Header";
import {
  Database,
  Plus,
  Trash2,
  Shield,
  Globe,
  HardDrive,
  X,
  Check,
  Link2,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConnectionsStore } from "../../../core/stores/connectionsStore";

const ConnectionPage: React.FC = () => {
  const { t } = useTranslation();
  const { connections, addConnection, deleteConnection } =
    useConnectionsStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newConn, setNewConn] = useState<Partial<DBConnection>>({
    id: crypto.randomUUID(),
    name: "",
    type: "postgres",
    host: "localhost",
    port: 5432,
    database: "",
    user: "postgres",
    ssl: false,
    apiUrl: "",
    apiToken: "",
  });

  const handleSave = () => {
    if (!newConn.name) return;
    if (newConn.type === "postgres" && !newConn.host) return;
    if (newConn.type === "api" && !newConn.apiUrl) return;

    addConnection(newConn as DBConnection);
    setIsAdding(false);
    setNewConn({
      id: crypto.randomUUID(),
      name: "",
      type: "postgres",
      host: "localhost",
      port: 5432,
      database: "",
      user: "postgres",
      ssl: false,
      apiUrl: "",
      apiToken: "",
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header name={t("connections.pageTitle")} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {t("connections.title")}
              </h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest opacity-60">
                {t("connections.manageDataSources")}
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              <Plus size={18} /> {t("connections.new")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.length === 0 && !isAdding && (
              <div className="col-span-full text-center py-32 bg-[#111217] border border-[#1f2127] rounded-[3rem] border-dashed">
                <Database size={64} className="mx-auto mb-6 text-gray-800" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                  {t("connections.none")}
                </p>
              </div>
            )}

            {connections.map((conn) => (
              <div
                key={conn.id}
                className="bg-[#111217] border border-[#1f2127] rounded-3xl p-6 flex flex-col group hover:border-blue-500/50 transition-all shadow-lg relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${
                      conn.type === "api"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    } rounded-2xl flex items-center justify-center border`}
                  >
                    {conn.type === "api" ? (
                      <Globe size={24} />
                    ) : (
                      <HardDrive size={24} />
                    )}
                  </div>
                  <button
                    onClick={() => deleteConnection(conn.id)}
                    className="p-2 text-gray-600 hover:text-red-400 transition-all hover:bg-red-500/10 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h4 className="font-black text-white text-sm uppercase tracking-wider mb-2">
                  {conn.name}
                </h4>

                <div className="space-y-2">
                  {conn.type === "api" ? (
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold truncate">
                      <Link2 size={12} className="text-purple-500 shrink-0" />
                      <span className="truncate">{conn.apiUrl}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold truncate">
                        <Globe size={12} className="text-blue-500 shrink-0" />
                        <span>
                          {conn.host}:{conn.port}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold truncate">
                        <Database
                          size={12}
                          className="text-blue-500 shrink-0"
                        />
                        <span>{conn.database}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[#1f2127] flex items-center justify-between">
                  <span
                    className={`text-[8px] font-black uppercase px-2 py-1 rounded ${
                      conn.type === "api"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {conn.type}
                  </span>
                  {conn.ssl && (
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-500/70">
                      <Shield size={10} /> Secure
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isAdding && (
              <div className="col-span-full bg-[#181b1f] border border-blue-600/50 rounded-[3rem] p-8 lg:p-12 shadow-[0_0_100px_rgba(37,99,235,0.1)] animate-in slide-in-from-top-4">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      {t("connections.addTitle")}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                      {t("connections.configureParams")}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="p-3 hover:bg-[#111217] rounded-2xl text-gray-500 hover:text-white transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                  {/* Sélecteur de Type */}
                  <div className="lg:w-1/3 space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                      {t("connections.sourceType")}
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() =>
                          setNewConn({ ...newConn, type: "postgres" })
                        }
                        className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all text-left ${
                          newConn.type === "postgres"
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "bg-[#111217] border-[#2c3235] text-gray-500 hover:border-blue-500/30"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl ${
                            newConn.type === "postgres"
                              ? "bg-white/20"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          <Database size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">
                            {t("connections.postgresql")}
                          </p>
                          <p className="text-[9px] opacity-60 font-bold uppercase mt-0.5">
                            {t("connections.directDatabase")}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setNewConn({ ...newConn, type: "api" })}
                        className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all text-left ${
                          newConn.type === "api"
                            ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20"
                            : "bg-[#111217] border-[#2c3235] text-gray-500 hover:border-purple-500/30"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl ${
                            newConn.type === "api"
                              ? "bg-white/20"
                              : "bg-purple-500/10 text-purple-400"
                          }`}
                        >
                          <Globe size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">
                            {t("connections.apiJson")}
                          </p>
                          <p className="text-[9px] opacity-60 font-bold uppercase mt-0.5">
                            {t("connections.remoteEndpoint")}
                          </p>
                        </div>
                      </button>
                    </div>

                    <div className="mt-6 p-5 bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] flex gap-3">
                      <Info size={16} className="text-blue-500 shrink-0" />
                      <p className="text-[9px] text-blue-400/80 leading-relaxed font-bold uppercase tracking-wider italic">
                        {t("connections.securityNote")}
                      </p>
                    </div>
                  </div>

                  {/* Champs dynamiques */}
                  <div className="flex-1 space-y-8 bg-[#111217] p-8 rounded-[2.5rem] border border-[#1f2127]">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                        {t("connections.generalConfig")}
                      </label>
                      <input
                        className="w-full bg-[#181b1f] border border-[#2c3235] rounded-2xl px-5 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all font-bold"
                        value={newConn.name}
                        onChange={(e) =>
                          setNewConn({ ...newConn, name: e.target.value })
                        }
                        placeholder={t("connections.connectionNamePlaceholder")}
                      />
                    </div>

                    {newConn.type === "postgres" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-3 space-y-2">
                              <label className="block text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                                {t("connections.host")}
                              </label>
                              <input
                                className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all"
                                value={newConn.host}
                                onChange={(e) =>
                                  setNewConn({
                                    ...newConn,
                                    host: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                                {t("connections.port")}
                              </label>
                              <input
                                type="number"
                                className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all"
                                value={newConn.port}
                                onChange={(e) =>
                                  setNewConn({
                                    ...newConn,
                                    port: parseInt(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                              {t("connections.databaseName")}
                            </label>
                            <input
                              className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all"
                              value={newConn.database}
                              onChange={(e) =>
                                setNewConn({
                                  ...newConn,
                                  database: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                              {t("connections.user")}
                            </label>
                            <input
                              className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all"
                              value={newConn.user}
                              onChange={(e) =>
                                setNewConn({ ...newConn, user: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                              {t("connections.password")}
                            </label>
                            <input
                              type="password"
                              className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all"
                              value={newConn.password}
                              onChange={(e) =>
                                setNewConn({
                                  ...newConn,
                                  password: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center gap-3 pt-2">
                            <div
                              onClick={() =>
                                setNewConn({ ...newConn, ssl: !newConn.ssl })
                              }
                              className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-all ${
                                newConn.ssl ? "bg-blue-600" : "bg-gray-700"
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full transition-transform ${
                                  newConn.ssl
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                }`}
                              />
                            </div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {t("connections.requireSsl")}
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                          <label className="block text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                            {t("connections.apiUrlLabel")}
                          </label>
                          <input
                            className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-all"
                            value={newConn.apiUrl}
                            onChange={(e) =>
                              setNewConn({ ...newConn, apiUrl: e.target.value })
                            }
                            placeholder={t("connections.apiUrlPlaceholder")}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                            {t("connections.apiTokenLabel")}
                          </label>
                          <input
                            type="password"
                            className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-all"
                            value={newConn.apiToken}
                            onChange={(e) =>
                              setNewConn({
                                ...newConn,
                                apiToken: e.target.value,
                              })
                            }
                            placeholder={t("connections.apiTokenPlaceholder")}
                          />
                        </div>
                        <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                          <p className="text-[9px] text-purple-400/80 leading-relaxed font-bold uppercase tracking-wider">
                            {t("connections.apiNote")}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-6 flex justify-end gap-4">
                      <button
                        onClick={() => setIsAdding(false)}
                        className="px-6 py-3 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        onClick={handleSave}
                        className={`px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95 ${
                          newConn.type === "api"
                            ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
                            : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                        }`}
                      >
                        <Check size={18} /> {t("connections.saveConn")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPage;
