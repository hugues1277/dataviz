import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import type { DashboardVariable } from "../../../../../shared/types";
import VariableItem from "./parts/variables/VariableItem";
import VariableEditForm from "./parts/variables/VariableEditForm";

export interface VariablesPickerProps {
  isLocked?: boolean;
  queryVariables?: string[]; // Optionnel : filtre les variables à afficher par leurs noms
  variables: DashboardVariable[];
  variableValues: Record<string, string>;
  addVariable: (variable: DashboardVariable) => Promise<void>;
  updateVariable: (variable: DashboardVariable) => Promise<void>;
  deleteVariable: (variableId: string) => Promise<void>;
  setVariableValue: (name: string, value: string) => void;
  setVariableValues: (values: Record<string, string>) => void;
  resetVariableValues: () => void;
}

const VariablesPicker: React.FC<VariablesPickerProps> = ({
  isLocked = true,
  queryVariables = [],
  variables: allVariables,
  variableValues: allValues,
  addVariable,
  updateVariable,
  deleteVariable,
  setVariableValue,
}) => {
  const { t } = useTranslation();

  // Filtrer les variables si queryVariables est fourni
  const variables = useMemo(() => {
    if (queryVariables && queryVariables.length > 0) {
      return allVariables.filter((v) => queryVariables.includes(v.name));
    }
    return allVariables;
  }, [queryVariables, allVariables]);

  // Filtrer les valeurs pour ne garder que celles des variables affichées
  const values = useMemo(() => {
    const filtered: Record<string, string> = {};
    variables.forEach((v) => {
      if (allValues[v.name] !== undefined) {
        filtered[v.name] = allValues[v.name];
      } else {
        filtered[v.name] = v.defaultValue;
      }
    });
    return filtered;
  }, [variables, allValues]);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DashboardVariable>>({});
  const [tempTextValues, setTempTextValues] = useState<Record<string, string>>(
    {}
  );

  const handleStartAdd = useCallback(() => {
    setEditForm({
      id: crypto.randomUUID(),
      name: "ma_variable",
      label: t("variables.defaultVariable"),
      type: "text",
      defaultValue: "",
      options: [],
    });
    setIsAdding(true);
  }, [t]);

  const handleStartEdit = useCallback((v: DashboardVariable) => {
    setEditForm({ ...v });
    setIsEditing(v.id);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editForm.name || !editForm.label) return;
    const variable = editForm as DashboardVariable;
    if (isAdding) {
      await addVariable(variable);
    } else {
      await updateVariable(variable);
    }
    setIsAdding(false);
    setIsEditing(null);
  }, [editForm, isAdding, addVariable, updateVariable]);

  const handleCloseEdit = useCallback(() => {
    setIsAdding(false);
    setIsEditing(null);
  }, []);

  const handleValueChange = useCallback(
    (name: string, value: string) => {
      setVariableValue(name, value);
    },
    [setVariableValue]
  );

  const handleDelete = useCallback(
    async (variableId: string) => {
      await deleteVariable(variableId);
      setIsEditing(null);
    },
    [deleteVariable]
  );

  return (
    <div className="flex items-center gap-3 md:flex-wrap overflow-x-auto scrollbar-none w-full">
      {variables.length === 0 && !isLocked && (
        <span className="text-[9px] font-bold text-gray-700 tracking-[0.2em] italic">
          {t("variables.none")}
        </span>
      )}

      {variables.map((v) => {
        const value = values[v.name] == null ? v.defaultValue : values[v.name];
        return (
          <VariableItem
            key={v.id}
            variable={v}
            value={value}
            isLocked={isLocked}
            onValueChange={handleValueChange}
            onEdit={handleStartEdit}
            tempTextValues={tempTextValues}
            setTempTextValues={setTempTextValues}
          />
        );
      })}

      {!isLocked && (
        <button
          onClick={handleStartAdd}
          className="p-1.5 text-gray-600 hover:text-blue-400 hover:bg-blue-400/5 rounded-full border border-dashed border-gray-800 hover:border-blue-500/30 transition-all flex items-center justify-center"
          title={t("variables.add")}
        >
          <Plus size={12} />
        </button>
      )}

      {(isAdding || isEditing) && (
        <VariableEditForm
          isEditing={!!isEditing}
          editForm={editForm}
          setEditForm={setEditForm}
          onClose={handleCloseEdit}
          onSave={handleSave}
          onDelete={isEditing ? handleDelete : undefined}
          editingId={isEditing}
        />
      )}
    </div>
  );
};

export default VariablesPicker;
