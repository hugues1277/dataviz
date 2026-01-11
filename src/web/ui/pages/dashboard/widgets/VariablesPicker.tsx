import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Settings2,
  Trash2,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  Hash,
  Type,
  ChevronDown,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  DashboardVariable,
  VARIABLE_TYPES,
  VariableType,
} from "../../../../../shared/types/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/shadcn/popover";
import { Calendar } from "../../../components/shadcn/calendar";
import { parseISO, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useVariables } from "../../../../core/hooks/dashboard/useVariables";
import { useDashboardsStore } from "@/src/web/core/stores/dashboardsStore";

interface VariablesPickerProps {
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

interface DatePickerInputCompactProps {
  date: string;
  onDateChange: (date: Date | undefined) => void;
}

const DatePickerInputCompact: React.FC<DatePickerInputCompactProps> = ({
  date,
  onDateChange,
}) => {
  const [open, setOpen] = useState(false);
  const selectedDate = date ? parseISO(date) : undefined;
  const { t } = useTranslation();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="bg-transparent border-none text-[10px] text-blue-400 font-black tracking-wider px-1 py-0.5 outline-none cursor-pointer focus:text-blue-300 transition-colors hover:text-blue-300 flex items-center gap-1">
          <CalendarIcon size={10} />
          {selectedDate
            ? format(selectedDate, "dd/MM/yy")
            : t("datePicker.select")}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-[#2c3235] bg-[#181b1f] z-[250]"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onDateChange(date);
            setOpen(false);
          }}
          locale={fr}
          initialFocus
          className="bg-[#181b1f] text-white [--cell-size:2.5rem] sm:[--cell-size:2rem]"
          classNames={{
            day: "text-white hover:bg-[#2c3235]",
            day_selected: "bg-blue-600 text-white hover:bg-blue-600",
            day_today: "bg-[#2c3235] text-white",
            caption_label: "text-white text-sm sm:text-base",
            dropdown: "bg-[#111217] border-[#2c3235] text-white",
            button_previous: "text-white hover:bg-[#2c3235]",
            button_next: "text-white hover:bg-[#2c3235]",
            weekday:
              "text-gray-400 text-xs sm:text-sm font-medium min-w-[2.5rem] sm:min-w-[2rem] px-1",
            weekdays: "mb-2",
            week: "gap-1 sm:gap-0",
            day_button:
              "min-w-[2.5rem] sm:min-w-[2rem] min-h-[2.5rem] sm:min-h-[2rem] text-sm",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

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

  const renderInput = (v: DashboardVariable) => {
    const value = values[v.name] || v.defaultValue;

    switch (v.type) {
      case VARIABLE_TYPES.BOOLEAN: {
        const isTrue = value === "true";
        return (
          <button
            onClick={() => handleValueChange(v.name, isTrue ? "false" : "true")}
            className={`transition-all rounded-md hover:bg-white/5 ${
              isTrue ? "text-blue-400" : "text-gray-600"
            }`}
          >
            {isTrue ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
        );
      }
      case VARIABLE_TYPES.SELECT:
        return (
          <div className="relative flex items-center group/select">
            <select
              className="bg-transparent border-none text-[10px] text-blue-400 font-black tracking-wider pl-1 pr-4 py-0.5 outline-none cursor-pointer appearance-none hover:text-blue-300 transition-colors"
              value={value}
              onChange={(e) => handleValueChange(v.name, e.target.value)}
            >
              {v.options?.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#111217] text-white font-bold"
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={10}
              className="absolute right-0 text-gray-600 group-hover/select:text-blue-400 pointer-events-none transition-colors"
            />
          </div>
        );
      case VARIABLE_TYPES.DATE:
        return (
          <DatePickerInputCompact
            date={value}
            onDateChange={(date) =>
              handleValueChange(
                v.name,
                date ? date.toISOString().split("T")[0] : ""
              )
            }
          />
        );
      case VARIABLE_TYPES.NUMBER:
        return (
          <input
            type="number"
            className="bg-transparent border-none text-[10px] text-blue-400 font-black tracking-wider px-1 py-0.5 outline-none w-16 hover:bg-white/5 rounded transition-all focus:bg-white/10"
            value={value}
            onChange={(e) => handleValueChange(v.name, e.target.value)}
          />
        );
      default:
        return (
          <input
            type="text"
            className="bg-transparent border-none text-[10px] text-blue-400 font-black tracking-wider px-1 py-0.5 outline-none w-24 hover:bg-white/5 rounded transition-all focus:bg-white/10"
            value={value}
            onChange={(e) => handleValueChange(v.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="flex items-center gap-3 md:flex-wrap overflow-x-auto scrollbar-none w-full">
      {variables.length === 0 && !isLocked && (
        <span className="text-[9px] font-bold text-gray-700 tracking-[0.2em] italic">
          {t("variables.none")}
        </span>
      )}

      {variables.map((v) => (
        <div
          key={v.id}
          className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] rounded-full group transition-all"
        >
          <span className="text-[9px] font-bold text-gray-500 tracking-widest whitespace-nowrap">
            {v.label}
          </span>
          <div className="w-px h-3 bg-white/10 mx-0.5" />
          <div className="flex items-center gap-1">
            {renderInput(v)}
            {!isLocked && (
              <button
                onClick={() => handleStartEdit(v)}
                className="ml-1 p-1 text-gray-700 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <Settings2 size={10} />
              </button>
            )}
          </div>
        </div>
      ))}

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
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#111217] border border-[#1f2127] rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
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
                onClick={handleCloseEdit}
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
                    <option value="number">
                      {t("variables.types.number")}
                    </option>
                    <option value="date">{t("variables.types.date")}</option>
                    <option value="select">
                      {t("variables.types.select")}
                    </option>
                    <option value="boolean">
                      {t("variables.types.boolean")}
                    </option>
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
              {isEditing ? (
                <button
                  onClick={async () => {
                    await deleteVariable(isEditing!);
                    setIsEditing(null);
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
                  onClick={handleSave}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  <Check size={16} /> {t("common.save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariablesPicker;
