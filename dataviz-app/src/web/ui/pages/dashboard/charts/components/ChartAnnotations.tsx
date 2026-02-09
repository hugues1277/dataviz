import React from "react";
import { ReferenceLine } from "recharts";
import { AnnotationConfig } from "../../../../../../shared/types/types";

interface ChartAnnotationsProps {
  annotations: AnnotationConfig[];
  fontSize?: number;
}

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
              position: isX ? "insideTopLeft" : "insideTopRight",
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
