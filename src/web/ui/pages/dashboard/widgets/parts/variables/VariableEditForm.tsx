import React from "react";
import { useTranslation } from "react-i18next";
import { X, Check, Trash2, CalendarDays, Hash, Type } from "lucide-react";
import {
  DashboardVariable,
  VARIABLE_TYPES,
  VariableType,
} from "../../../../../../../shared/types";

interface VariableEditFormProps {
  isEditing: boolean;
  editForm: Partial<DashboardVariable>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<DashboardVariable>>>;
  onClose: () => void;
  onSave: () => void;
  onDelete?: (variableId: string) => Promise<void>;
  editingId: string | null;
}

const VariableEditForm: React.FC<VariableEditFormProps> = ({
  isEditing,
  editForm,
  setEditForm,
  onClose,
  onSave,
  onDelete,
  editingId,
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-210 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#111217] border border-[#1f2127] rounded-4xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-[#1f2127] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white tracking-[0.2em]">
              {t("variables.configTitle")}
            </h3>
            <p className="text-[9px] text-gray-500 font-bold tracking-widest mt-1">
              {t("variables.configDesc")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                <Type size={10} /> {t("variables.labelUI")}
              </label>
              <input
                type="text"
                placeholder={t("variables.labelPlaceholder")}
                className="w-full bg-[#0b0e14] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all"
                value={editForm.label}
                onChange={(e) =>
                  setEditForm({ ...editForm, label: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                <Hash size={10} /> {t("variables.sqlName")}
              </label>
              <input
                type="text"
                placeholder={t("variables.sqlNamePlaceholder")}
                className="w-full bg-[#0b0e14] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-blue-400 font-mono outline-none focus:border-blue-500 transition-all"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    name: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 tracking-widest ml-1">
                {t("variables.dataType")}
              </label>
              <select
                className="w-full bg-[#0b0e14] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 appearance-none transition-all"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    type: e.target.value as VariableType,
                  })
                }
              >
                <option value="text">{t("variables.types.text")}</option>
                <option value="number">{t("variables.types.number")}</option>
                <option value="date">{t("variables.types.date")}</option>
                <option value="select">{t("variables.types.select")}</option>
                <option value="boolean">{t("variables.types.boolean")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 tracking-widest ml-1">
                {t("variables.defaultValue")}
              </label>
              {editForm.type === "boolean" ? (
                <select
                  className="w-full bg-[#0b0e14] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none"
                  value={editForm.defaultValue}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      defaultValue: e.target.value,
                    })
                  }
                >
                  <option value="true">
                    {t("variables.booleanValues.enabled")}
                  </option>
                  <option value="false">
                    {t("variables.booleanValues.disabled")}
                  </option>
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full bg-[#0b0e14] border border-[#2c3235] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all"
                  value={editForm.defaultValue}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      defaultValue: e.target.value,
                    })
                  }
                />
              )}
            </div>
          </div>

          {editForm.type === VARIABLE_TYPES.DATE && (
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
              <CalendarDays
                className="text-blue-500 shrink-0 mt-0.5"
                size={16}
              />
              <div>
                <p className="text-[10px] font-black text-blue-400 tracking-widest mb-1">
                  {t("variables.temporalDynamics")}
                </p>
                <p className="text-[9px] text-blue-400/60 leading-relaxed font-bold tracking-wider italic">
                  {t("variables.temporalNote")}
                </p>
              </div>
            </div>
          )}

          {editForm.type === VARIABLE_TYPES.SELECT && (
            <div className="space-y-4">
              <label className="text-[9px] font-black text-gray-500 tracking-widest block ml-1">
                {t("variables.listOptions")}
              </label>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
                {editForm.options?.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 group/opt">
                    <input
                      placeholder={t("variables.optionLabel")}
                      className="flex-1 bg-[#0b0e14] border border-[#2c3235] rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-blue-500"
                      value={opt.label}
                      onChange={(e) => {
                        const newOpts = [...(editForm.options || [])];
                        newOpts[idx].label = e.target.value;
                        setEditForm({ ...editForm, options: newOpts });
                      }}
                    />
                    <input
                      placeholder={t("variables.optionValue")}
                      className="flex-1 bg-[#0b0e14] border border-[#2c3235] rounded-lg px-3 py-2 text-[10px] text-blue-400 font-mono outline-none focus:border-blue-500"
                      value={opt.value}
                      onChange={(e) => {
                        const newOpts = [...(editForm.options || [])];
                        newOpts[idx].value = e.target.value;
                        setEditForm({ ...editForm, options: newOpts });
                      }}
                    />
                    <button
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          options: editForm.options?.filter(
                            (_, i) => i !== idx
                          ),
                        })
                      }
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
                  setEditForm({
                    ...editForm,
                    options: [
                      ...(editForm.options || []),
                      { label: "", value: "" },
                    ],
                  })
                }
                className="w-full py-2.5 bg-[#0b0e14] border border-dashed border-[#2c3235] text-gray-500 hover:text-blue-400 hover:border-blue-500/50 rounded-xl text-[9px] font-black tracking-widest transition-all"
              >
                {t("variables.addOption")}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-[#0e1014] border-t border-[#1f2127] flex items-center justify-between px-8">
          {isEditing && editingId && onDelete ? (
            <button
              onClick={async () => {
                await onDelete(editingId);
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-xl text-[10px] font-black tracking-widest transition-all"
            >
              <Trash2 size={14} /> {t("common.delete")}
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <button
              onClick={onSave}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Check size={16} /> {t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariableEditForm;
