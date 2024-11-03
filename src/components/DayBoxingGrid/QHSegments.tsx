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
        width: "260px",
      }}
    >
      {segments.map((seg) => (
        <div
          key={seg.segment}
          style={{
            height: theme.cellSize,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 12px",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            borderRadius: theme.borderRadius,
            border: `1px solid ${
              theme.colors[seg.mainType as keyof typeof theme.colors] ||
              theme.colors.base
            }`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 背景指示器 */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "3px",
              backgroundColor:
                theme.colors[seg.mainType as keyof typeof theme.colors],
              opacity: 0.8,
            }}
          />

          {/* 段落标识 */}
          <div
            style={{
              fontWeight: 600,
              fontSize: "13px",
              color: theme.colors[seg.mainType as keyof typeof theme.colors],
              width: "16px",
              flexShrink: 0,
            }}
          >
            {seg.segment}
          </div>

          {/* 类型信息 - 改为上下布局 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "2px",
              flex: 1,
              minWidth: 0,
              height: "100%",
            }}
          >
            {/* 上行：类型信息 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                lineHeight: "11px",
                color: "rgba(0,0,0,0.7)",
              }}
            >
              <span
                style={{
                  padding: "1px 4px",
                  backgroundColor: "rgba(0,0,0,0.04)",
                  borderRadius: "2px",
                  fontSize: "10px",
                  fontWeight: 500,
                }}
              >
                {seg.type}
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor:
                      theme.colors[seg.mainType as keyof typeof theme.colors],
                  }}
                />
                {seg.mainType}
                {seg.secondaryType && (
                  <>
                    <span style={{ opacity: 0.5, margin: "0 -1px" }}>-</span>
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        backgroundColor:
                          theme.colors[
                            seg.secondaryType as keyof typeof theme.colors
                          ],
                      }}
                    />
                    {seg.secondaryType}
                  </>
                )}
              </div>
            </div>

            {/* 下行：时间范围 */}
            <div
              style={{
                fontSize: "10px",
                lineHeight: "10px",
                color: "rgba(0,0,0,0.5)",
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
