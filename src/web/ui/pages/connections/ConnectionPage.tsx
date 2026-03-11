import React, { useState, useCallback } from "react";
import type { DBConnection } from "../../../../shared/types";
import { useUserRole } from "@/src/web/core/hooks/useUserRole";
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
import { addConnectionUseCase } from "../../../core/useCases/connections/addConnectionUseCase";
import { updateConnectionUseCase } from "../../../core/useCases/connections/updateConnectionUseCase";
import { deleteConnectionUseCase } from "../../../core/useCases/connections/deleteConnectionUseCase";
import { setDefaultConnectionUseCase } from "../../../core/useCases/connections/setDefaultConnectionUseCase";
import { useRefetchDashboardCharts } from "@/src/web/core/hooks/dashboard/useChartQuery";
import { useDialog } from "../../components/modal/DialogContext";

const ConnectionPage: React.FC = () => {
  const { t } = useTranslation();
  const { canEdit } = useUserRole();
  const { connections } = useConnectionsStore();
  const { confirm } = useDialog();

  const [isAdding, setIsAdding] = useState(false);
  const [newConn, setNewConn] = useState<DBConnection | null>(null);
  const refetchDashboardCharts = useRefetchDashboardCharts();

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

  const handleSave = async (connection: DBConnection) => {
    if (isAdding) {
      const id = await addConnectionUseCase.execute(connection);
      if (connection.isDefault && id) {
        await setDefaultConnectionUseCase.execute(id);
      }
    } else {
      await updateConnectionUseCase.execute(connection);
      if (connection.isDefault) {
        await setDefaultConnectionUseCase.execute(connection.id);
      }
      await refetchDashboardCharts();
    }

    resetForm();
  };

  const handleSetDefault = useCallback(
    async (id: string) => {
      await setDefaultConnectionUseCase.execute(id);
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      confirm({
        title: t("connections.deleteConfirmTitle"),
        description: t("connections.deleteConfirmDesc", {
          name: name,
        }),
        type: "danger",
        confirmLabel: t("common.delete"),
        onConfirm: async () => {
          await deleteConnectionUseCase.execute(id);
        },
      });
    },
    [confirm, t]
  );

  return connections === null ? (
    <PageLoading />
  ) : (
    <div className="flex flex-col h-full overflow-hidden">
      <Header name={t("connections.pageTitle")} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-6">
          <PageHeader
            title={t("connections.title")}
            description={t("connections.manageDataSources")}
            actions={
              canEdit ? (
                <Button onClick={() => handleAdd()}>
                  <Plus size={16} /> {t("connections.new")}
                </Button>
              ) : undefined
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.length === 0 && !isAdding && <EmptyConnectionsState />}

            {connections.map((conn) => (
              <ConnectionCard
                key={conn.id}
                connection={conn}
                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canEdit ? handleDelete : undefined}
                onSetDefault={canEdit ? handleSetDefault : undefined}
              />
            ))}

            {canEdit && (
              <ConnectionEditor
                connection={newConn}
                isAdding={isAdding}
                onClose={resetForm}
                onSave={handleSave}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPage;
