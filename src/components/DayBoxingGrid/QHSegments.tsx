import React, { useState } from "react";
import { QHAnalysis, ThemeConfig } from "../../types";

interface QHSegmentsProps {
  segments: QHAnalysis[];
  theme: ThemeConfig;
}

// 获取段落类型标识
const getPartTypeSymbol = (seg: QHAnalysis) => {
  const segment = seg.segment;
  const type = !seg.secondaryType
    ? "Fu"
    : seg.type === "balance"
    ? "Ba"
    : seg.type === "chaos"
    ? "Ch"
    : "Mi";
  return `${segment}${type}`;
};

// 获取段落类型说明
const getPartTypeDescription = (seg: QHAnalysis) => {
  if (!seg.secondaryType) return `${seg.mainType} Full Part`;
  if (seg.type === "balance")
    return `${seg.mainType}-${seg.secondaryType} Balance Part`;
  if (seg.type === "chaos") return "Chaos Part";
  return `${seg.mainType}-${seg.secondaryType} Mix Part`;
};

export const QHSegments: React.FC<QHSegmentsProps> = ({ segments, theme }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: theme.gap,
        width: "150px",
      }}
    >
      {segments.map((seg) => (
        <div
          key={seg.segment}
          style={{
            height: theme.cellSize,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 8px",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            borderRadius: theme.borderRadius,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            position: "relative",
          }}
          onMouseEnter={() => setHoveredSegment(seg.segment)}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          {/* 左侧色块和标识 */}
          <div
            style={{
              width: "48px",
              height: "24px",
              borderRadius: "4px",
              backgroundColor: `${
                theme.colors[seg.mainType as keyof typeof theme.colors]
              }15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
              gap: "2px",
            }}
          >
            {/* 段落标识 */}
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: theme.colors[seg.mainType as keyof typeof theme.colors],
                opacity: 0.8,
                padding: "0 2px",
                borderRadius: "2px",
              }}
            >
              {seg.segment}
            </span>
            {/* 类型标识 */}
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: theme.colors[seg.mainType as keyof typeof theme.colors],
                opacity: 0.6,
                padding: "0 2px",
                borderRadius: "2px",
              }}
            >
              {!seg.secondaryType
                ? "Fu"
                : seg.type === "balance"
                ? "Ba"
                : seg.type === "chaos"
                ? "Ch"
                : "Mi"}
            </span>
          </div>

          {/* Tooltip */}
          {hoveredSegment === seg.segment && (
            <div
              style={{
                position: "absolute",
                left: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                marginLeft: "8px",
                padding: "6px 10px",
                backgroundColor: "rgba(0,0,0,0.8)",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                zIndex: 1000,
              }}
            >
              {getPartTypeDescription(seg)}
            </div>
          )}

          {/* 右侧信息 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "10px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                marginBottom: "1px",
                color: theme.colors[seg.mainType as keyof typeof theme.colors],
              }}
            >
              {seg.mainType}
              {seg.secondaryType && (
                <>
                  <span style={{ opacity: 0.3 }}>/</span>
                  <span
                    style={{
                      color:
                        theme.colors[
                          seg.secondaryType as keyof typeof theme.colors
                        ],
                    }}
                  >
                    {seg.secondaryType}
                  </span>
                </>
              )}
            </div>

            <div
              style={{
                fontSize: "9px",
                color: "rgba(0,0,0,0.45)",
                fontFamily: "monospace",
              }}
            >
              {`${String(seg.startHour).padStart(2, "0")}:00-${String(
                seg.endHour
              ).padStart(2, "0")}:00`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
