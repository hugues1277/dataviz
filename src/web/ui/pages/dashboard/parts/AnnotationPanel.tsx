import React from "react";
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import type { AnnotationConfig } from "../../../../../shared/types";
import { useTranslation } from "react-i18next";
import { ANNOTATION_COLORS } from "../../../../../shared/constants";

interface AnnotationPanelProps {
  isOpen: boolean;
  annotations: AnnotationConfig[];
  newAnnotation: AnnotationConfig;
  setNewAnnotation: (annotation: AnnotationConfig) => void;
  addAnnotation: (annotation: AnnotationConfig) => void;
  removeAnnotation: (id: string) => void;
  updateAnnotation: (id: string, updates: Partial<AnnotationConfig>) => void;
  onEditAnnotation: (annotation: AnnotationConfig) => void;
  onEditComplete: () => void;
  editingAnnotationId: string | null;
}

const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  isOpen,
  annotations,
  newAnnotation,
  setNewAnnotation,
  addAnnotation,
  removeAnnotation,
  updateAnnotation,
  onEditAnnotation,
  onEditComplete,
  editingAnnotationId,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="w-80 bg-[#111217] border-l border-[#1f2127] flex flex-col h-full animate-in slide-in-from-right duration-300 z-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
        {/* Formulaire d'ajout */}
        <section className="space-y-4">
          <div className="space-y-3 bg-[#181b1f] p-4 rounded-2xl border border-[#2c3235]">
            <h4 className="text-[10px] font-black text-gray-500 tracking-widest flex items-center justify-between">
              {editingAnnotationId ? t("annotations.editing") : t("annotations.addByClicking")}
              {editingAnnotationId && (
                <button
                  type="button"
                  onClick={onEditComplete}
                  className="text-[9px] font-bold text-gray-500 hover:text-white transition-colors"
                >
                  {t("annotations.cancel")}
                </button>
              )}
            </h4>

            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg border transition-all ${
                  newAnnotation.type === "y"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-[#111217] border-[#2c3235] text-gray-500"
                }`}
                onClick={() =>
                  setNewAnnotation({
                    ...newAnnotation,
                    type: "y",
                    labelPosition: (newAnnotation.labelPosition === "left" || newAnnotation.labelPosition === "right")
                      ? newAnnotation.labelPosition
                      : "right",
                  })
                }
              >
                {t("annotations.yAxis")}
              </button>
              <button
                className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg border transition-all ${
                  newAnnotation.type === "x"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-[#111217] border-[#2c3235] text-gray-500"
                }`}
                onClick={() =>
                  setNewAnnotation({
                    ...newAnnotation,
                    type: "x",
                    labelPosition: (newAnnotation.labelPosition === "top" || newAnnotation.labelPosition === "bottom")
                      ? newAnnotation.labelPosition
                      : "top",
                  })
                }
              >
                {t("annotations.xAxis")}
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-600 uppercase ml-1">
                {t("annotations.labelPosition")}
              </label>
              <div className="flex gap-2">
                {newAnnotation.type === "x" ? (
                  <>
                    <button
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg border transition-all flex items-center justify-center gap-1 ${
                        (newAnnotation.labelPosition ?? "top") === "top"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-[#111217] border-[#2c3235] text-gray-500"
                      }`}
                      onClick={() =>
                        setNewAnnotation({ ...newAnnotation, labelPosition: "top" })
                      }
                    >
                      <ArrowUp size={10} />
                      {t("annotations.labelTop")}
                    </button>
                    <button
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg border transition-all flex items-center justify-center gap-1 ${
                        (newAnnotation.labelPosition ?? "top") === "bottom"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-[#111217] border-[#2c3235] text-gray-500"
                      }`}
                      onClick={() =>
                        setNewAnnotation({ ...newAnnotation, labelPosition: "bottom" })
                      }
                    >
                      <ArrowDown size={10} />
                      {t("annotations.labelBottom")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg border transition-all flex items-center justify-center gap-1 ${
                        (newAnnotation.labelPosition ?? "right") === "left"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-[#111217] border-[#2c3235] text-gray-500"
                      }`}
                      onClick={() =>
                        setNewAnnotation({ ...newAnnotation, labelPosition: "left" })
                      }
                    >
                      <ArrowLeft size={10} />
                      {t("annotations.labelLeft")}
                    </button>
                    <button
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg border transition-all flex items-center justify-center gap-1 ${
                        (newAnnotation.labelPosition ?? "right") === "right"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-[#111217] border-[#2c3235] text-gray-500"
                      }`}
                      onClick={() =>
                        setNewAnnotation({ ...newAnnotation, labelPosition: "right" })
                      }
                    >
                      <ArrowRight size={10} />
                      {t("annotations.labelRight")}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-600 uppercase ml-1">
                {t("annotations.label")}
              </label>
              <input
                type="text"
                placeholder={t("annotations.labelPlaceholder")}
                className="w-full bg-[#111217] border border-[#2c3235] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                value={newAnnotation.label || ""}
                onChange={(e) =>
                  setNewAnnotation({
                    ...newAnnotation,
                    label: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-600 uppercase ml-1">
                {t("annotations.value")}
              </label>
              <input
                type="text"
                placeholder={t("annotations.valuePlaceholder")}
                className="w-full bg-[#111217] border border-[#2c3235] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                value={newAnnotation.value || ""}
                onChange={(e) =>
                  setNewAnnotation({
                    ...newAnnotation,
                    value: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-[8px] font-black text-gray-600 uppercase ml-1">
                  {t("annotations.color")}
                </label>
                <div className="flex gap-2">
                  {ANNOTATION_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setNewAnnotation({ ...newAnnotation, color: c })
                      }
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        newAnnotation.color === c
                          ? "border-white"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  if (editingAnnotationId) {
                    updateAnnotation(editingAnnotationId, { ...newAnnotation, id: editingAnnotationId });
                    onEditComplete();
                  } else {
                    addAnnotation({
                      ...newAnnotation,
                      label: newAnnotation.label || String(newAnnotation.value),
                    });
                  }
                }}
                disabled={
                  !editingAnnotationId &&
                  (newAnnotation.value === "" ||
                    newAnnotation.value === undefined ||
                    (newAnnotation.type === "y" && isNaN(Number(newAnnotation.value))))
                }
                className="mt-4 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingAnnotationId ? (
                  <>
                    <Pencil size={16} />
                    <span className="text-[10px] font-bold">{t("annotations.update")}</span>
                  </>
                ) : (
                  <Plus size={18} />
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Liste existante */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Pin size={12} className="text-blue-500" />{" "}
            {t("annotations.active")}
          </h4>
          <div className="space-y-2">
            {annotations.length === 0 && (
              <p className="text-[10px] text-gray-600 text-center py-4 uppercase font-bold tracking-widest">
                {t("annotations.none")}
              </p>
            )}
            {annotations.map((ann) => (
              <div
                key={ann.id}
                className="flex items-center justify-between gap-2 p-3 bg-[#181b1f] border border-[#2c3235] rounded-2xl group"
              >
                <div className="flex items-center gap-3 truncate min-w-0">
                  <div
                    className="w-1.5 h-6 rounded-full shrink-0"
                    style={{ backgroundColor: ann.color }}
                  />
                  <div className="truncate min-w-0">
                    <p className="text-[10px] font-black text-white uppercase truncate">
                      {ann.label}
                    </p>
                    <p className="text-[8px] font-bold text-gray-500 uppercase">
                      {ann.type === "x"
                        ? t("annotations.axisX")
                        : t("annotations.axisY")}{" "}
                      : {ann.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditAnnotation(ann)}
                    className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors"
                    title={t("annotations.edit")}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => removeAnnotation(ann.id)}
                    className="p-1.5 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnnotationPanel;
