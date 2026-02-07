import React, { useState, useEffect } from "react";
import { DBConnection } from "../../../../../shared/types/types";
import { Database, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import Modal from "../../../components/modal/Modal";
import { Button } from "../../../components/Button";
import { testConnectionUseCase } from "../../../../core/useCases/connections/testConnectionUseCase";

interface ConnectionEditorProps {
  connection: DBConnection | null;
  isAdding: boolean;
  onClose: () => void;
  onSave: (connection: DBConnection) => void;
}

const ConnectionEditor: React.FC<ConnectionEditorProps> = ({
  connection,
  isAdding,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [newConn, setNewConn] = useState<DBConnection | null>(connection);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setNewConn(connection);
  }, [connection]);

  const handleSave = () => {
    if (!newConn?.name) return;
    if (newConn.type === "postgres" && !newConn.host) return;
    if (newConn.type === "api" && !newConn.apiUrl) return;

    onSave(newConn);
  };

  const handleCheckConnection = async () => {
    if (!newConn) return;
    setIsLoading(true);
    await testConnectionUseCase.execute(newConn);
    setIsLoading(false);
  };

  if (!newConn) return null;

  return (
    <Modal
      isOpen={newConn !== null}
      title={isAdding ? t("connections.addTitle") : t("connections.editTitle")}
      description={t("connections.configureParams")}
      icon={
        newConn.type === "api" ? <Globe size={16} /> : <Database size={16} />
      }
      onClose={onClose}
      actions={
        <>
          <Button
            onClick={handleCheckConnection}
            isLoading={isLoading}
            disabled={
              !newConn?.name ||
              (newConn.type === "postgres" && !newConn.host) ||
              (newConn.type === "api" && !newConn.apiUrl)
            }
          >
            {t("connections.checkConnection")}
          </Button>
          <Button onClick={handleSave} variant="primary">
            {t("common.save")}
          </Button>
        </>
      }
    >
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto scrollbar-thin bg-[#0e1014]">
        {/* Colonne gauche : Types de connexions */}
        <div className="w-full lg:w-[320px] lg:border-r border-[#1f2127] bg-[#111217] p-6 lg:p-8 shrink-0 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
              {t("connections.sourceType")}
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setNewConn({ ...newConn, type: "postgres" })}
                className={`flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${
                  newConn.type === "postgres"
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-[#181b1f] border-[#2c3235] text-gray-500 hover:border-blue-500/30"
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
                className={`flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${
                  newConn.type === "api"
                    ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "bg-[#181b1f] border-[#2c3235] text-gray-500 hover:border-purple-500/30"
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

            <div className="hidden lg:block mt-6 p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl gap-3 select-none">
              <p className="text-[9px] text-blue-400/80 leading-relaxed font-bold uppercase tracking-wider italic">
                {t("connections.securityNote")}
              </p>
            </div>
          </div>
        </div>

        {/* Colonne droite : Formulaire de configuration */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-8">
          <div className="space-y-8">
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
                  <div className="space-y-2">
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
                        setNewConn({
                          ...newConn,
                          user: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                      {t("connections.password")}
                      {!isAdding && (
                        <span className="text-gray-500 ml-2 normal-case">
                          ({t("connections.leaveEmptyToKeep")})
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all"
                      value={newConn.password || ""}
                      onChange={(e) =>
                        setNewConn({
                          ...newConn,
                          password: e.target.value,
                        })
                      }
                      placeholder={
                        !isAdding ? t("connections.passwordPlaceholder") : ""
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-7">
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
                          newConn.ssl ? "translate-x-4" : "translate-x-0"
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
                      setNewConn({
                        ...newConn,
                        apiUrl: e.target.value,
                      })
                    }
                    placeholder={t("connections.apiUrlPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                    {t("connections.apiTokenLabel")}
                    {!isAdding && (
                      <span className="text-gray-500 ml-2 normal-case">
                        ({t("connections.leaveEmptyToKeep")})
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-all"
                    value={newConn.apiToken || ""}
                    onChange={(e) =>
                      setNewConn({
                        ...newConn,
                        apiToken: e.target.value,
                      })
                    }
                    placeholder={
                      !isAdding
                        ? t("connections.apiTokenPlaceholder")
                        : t("connections.apiTokenPlaceholder")
                    }
                  />
                </div>
                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                  <p className="text-[9px] text-purple-400/80 leading-relaxed font-bold uppercase tracking-wider">
                    {t("connections.apiNote")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConnectionEditor;
