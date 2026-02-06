import React, { useState } from "react";
import { DBConnection } from "../../../../shared/types/types";
import Header from "../../components/layout/Header";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConnectionsStore } from "../../../core/stores/connectionsStore";
import { DEFAULT_CONNECTION } from "../../../../shared/constants";
import PageHeader from "../../components/layout/PageHeader";
import { Button } from "../../components/Button";
import ConnectionEditor from "./parts/ConnectionEditor";
import ConnectionCard from "./parts/ConnectionCard";
import EmptyConnectionsState from "./parts/EmptyConnectionsState";
import PageLoading from "../../components/layout/PageLoading";

const ConnectionPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    isLoading,
    connections,
    addConnection,
    updateConnection,
    deleteConnection,
  } = useConnectionsStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newConn, setNewConn] = useState<DBConnection | null>(null);

  const resetForm = () => {
    setIsAdding(false);
    setNewConn(null);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setNewConn({
      ...DEFAULT_CONNECTION,
      id: crypto.randomUUID(),
    });
  };

  const handleEdit = (conn: DBConnection) => {
    setIsAdding(false);
    setNewConn({
      ...conn,
      // Ne pas inclure le password/token dans le formulaire pour la sécurité
      password: "",
      apiToken: "",
    });
  };

  const handleSave = (connection: DBConnection) => {
    if (isAdding) {
      addConnection(connection);
    } else {
      updateConnection(connection);
    }

    resetForm();
  };

  return isLoading ? (
    <PageLoading />
  ) : (
    <div className="flex flex-col h-full overflow-hidden">
      <Header name={t("connections.pageTitle")} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-10">
          <PageHeader
            title={t("connections.title")}
            description={t("connections.manageDataSources")}
            actions={
              <Button onClick={() => handleAdd()}>
                <Plus size={16} /> {t("connections.new")}
              </Button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.length === 0 && !isAdding && <EmptyConnectionsState />}

            {connections.map((conn) => (
              <ConnectionCard
                key={conn.id}
                connection={conn}
                onEdit={handleEdit}
                onDelete={deleteConnection}
              />
            ))}

            <ConnectionEditor
              connection={newConn}
              isAdding={isAdding}
              onClose={resetForm}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPage;
