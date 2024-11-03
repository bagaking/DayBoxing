import React from "react";
import { QHAnalysis, ThemeConfig } from "../../types";

interface QHSegmentsProps {
  segments: QHAnalysis[];
  theme: ThemeConfig;
}

export const QHSegments: React.FC<QHSegmentsProps> = ({ segments, theme }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: theme.gap,
        marginLeft: theme.gap * 2,
      }}
    >
      {segments.map((seg) => (
        <div
          key={seg.segment}
          style={{
            padding: "4px 8px",
            borderRadius: theme.borderRadius,
            fontSize: "0.8em",
            backgroundColor: theme.colors.background,
            border: `1px solid ${
              theme.colors[seg.mainType] || theme.colors.base
            }`,
          }}
        >
          <div>{`${seg.segment}: ${seg.startHour}:00-${seg.endHour}:00`}</div>
          <div>{`${seg.type} (${seg.mainType}${
            seg.secondaryType ? `-${seg.secondaryType}` : ""
          })`}</div>
        </div>
      ))}
    </div>
  );
};
