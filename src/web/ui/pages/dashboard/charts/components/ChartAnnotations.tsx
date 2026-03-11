import React from "react";
import { ReferenceLine } from "recharts";
import { AnnotationConfig } from "../../../../../../shared/types/types";

interface ChartAnnotationsProps {
  annotations: AnnotationConfig[];
  fontSize?: number;
}

const getLabelPosition = (
  type: "x" | "y",
  labelPosition: "top" | "bottom" | "left" | "right" | undefined
): string => {
  if (type === "x") {
    const pos = (labelPosition === "top" || labelPosition === "bottom" ? labelPosition : undefined) ?? "top";
    return pos === "top" ? "insideTopLeft" : "insideBottomLeft";
  }
  const pos = (labelPosition === "left" || labelPosition === "right" ? labelPosition : undefined) ?? "right";
  return pos === "right" ? "insideTopRight" : "insideTopLeft";
};

export const ChartAnnotations: React.FC<ChartAnnotationsProps> = ({
  annotations,
  fontSize = 8,
}) => {
  return (
    <>
      {annotations.map((ann) => {
        const isX = ann.type === "x";
        return (
          <ReferenceLine
            key={ann.id}
            {...(isX ? { x: ann.value } : { y: Number(ann.value) })}
            stroke={ann.color}
            strokeDasharray="3 3"
            label={{
              value: ann.label,
              position: getLabelPosition(
                ann.type,
                ann.labelPosition ?? "top"
              ) as "insideTopLeft" | "insideBottomLeft" | "insideTopRight" | "insideBottomRight",
              fill: ann.color,
              fontSize: fontSize + 1,
              fontWeight: "normal",
              className: "capitalize tracking-tighter",
            }}
          />
        );
      })}
    </>
  );
};
