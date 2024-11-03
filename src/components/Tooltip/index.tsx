import React from "react";
import { TooltipProps } from "../../types";

export const Tooltip: React.FC<TooltipProps> = ({ data, position, theme }) => {
  if (!data) return null;

  return (
    <div
      className="day-boxing-tooltip"
      style={{
        position: "fixed",
        left: position.x + 10,
        top: position.y + 10,
        background: theme.colors.background,
        color: theme.colors.text,
        padding: "12px",
        borderRadius: theme.borderRadius,
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        zIndex: 1000,
        minWidth: "200px",
        border: "1px solid rgba(0,0,0,0.1)",
        fontSize: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor:
                theme.colors[data.type as keyof typeof theme.colors] ||
                theme.colors.base,
            }}
          />
          <div style={{ fontWeight: 500 }}>{`${data.hour}:00`}</div>
        </div>
        <div style={{ color: "rgba(0,0,0,0.6)" }}>{`Type: ${data.type}`}</div>
        {data.segment && (
          <div
            style={{
              marginTop: "4px",
              padding: "8px",
              backgroundColor: "rgba(0,0,0,0.03)",
              borderRadius: theme.borderRadius,
              fontSize: "13px",
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: "4px" }}>
              Segment Info
            </div>
            <div>{`Type: ${data.segment.type}`}</div>
            <div>{`Main: ${data.segment.mainType}`}</div>
            {data.segment.secondaryType && (
              <div>{`Secondary: ${data.segment.secondaryType}`}</div>
            )}
            <div>{`Time: ${data.segment.startHour}:00-${data.segment.endHour}:00`}</div>
          </div>
        )}
      </div>
    </div>
  );
};
