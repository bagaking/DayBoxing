import React, { useState } from "react";
import { QHAnalysis, ThemeConfig } from "../../types";
import styled from "styled-components";

interface QHSegmentsProps {
  segments: QHAnalysis[];
  theme: ThemeConfig;
}

// 获取段落类型标识
const getPartTypeSymbol = (seg: QHAnalysis) => {
  const theType = !seg.secondaryType
    ? "Fu"
    : seg.type === "balance"
    ? "Ba"
    : seg.type === "chaos"
    ? "Ch"
    : "Mi";
  return theType;
};

// 获取段落类型说明
const getPartTypeDescription = (seg: QHAnalysis) => {
  if (!seg.secondaryType) return `${seg.mainType} Full Part`;
  if (seg.type === "balance")
    return `${seg.mainType}-${seg.secondaryType} Balance Part`;
  if (seg.type === "chaos") return "Chaos Part";
  return `${seg.mainType}-${seg.secondaryType} Mix Part`;
};

export const SegmentsContainer = styled.div<{ theme: ThemeConfig }>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.gap}px;
  width: 150px;
`;

export const SegmentItem = styled.div<{ theme: ThemeConfig }>`
  height: ${(props) => props.theme.cellSize}px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  background-color: rgba(255, 255, 255, 0.98);
  border-radius: ${(props) => props.theme.borderRadius}px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
`;

export const TypeBlock = styled.div<{ color: string }>`
  width: 48px;
  height: 24px;
  border-radius: 4px;
  background-color: ${(props) => `${props.color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  gap: 2px;
`;

export const SegmentLabel = styled.span<{ color: string }>`
  font-size: 11px;
  font-weight: 500;
  color: ${(props) => props.color};
  opacity: 0.8;
  padding: 0 2px;
  border-radius: 2px;
`;

export const TypeLabel = styled.span<{ color: string }>`
  font-size: 10px;
  font-weight: 600;
  color: ${(props) => props.color};
  opacity: 0.6;
  padding: 0 2px;
  border-radius: 2px;
`;

export const SegmentTooltip = styled.div`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
  padding: 6px 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
`;

const formatHour = (hour: number) => {
  const normalizedHour = hour < 0 ? hour + 24 : hour;
  return String(normalizedHour).padStart(2, "0");
};

export const QHSegments: React.FC<QHSegmentsProps> = ({ segments, theme }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  return (
    <SegmentsContainer theme={theme}>
      {segments.map((seg) => {
        const mainColor =
          theme.colors[seg.mainType as keyof typeof theme.colors];
        const typeSymbol = getPartTypeSymbol(seg);

        return (
          <SegmentItem
            key={seg.segment}
            theme={theme}
            onMouseEnter={() => setHoveredSegment(seg.segment)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <TypeBlock color={mainColor}>
              <SegmentLabel color={mainColor}>{seg.segment}</SegmentLabel>
              <TypeLabel color={mainColor}>{typeSymbol}</TypeLabel>
            </TypeBlock>

            {hoveredSegment === seg.segment && (
              <SegmentTooltip>{getPartTypeDescription(seg)}</SegmentTooltip>
            )}

            {/* 右侧信息部分保持不变 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  marginBottom: "1px",
                  color:
                    theme.colors[seg.mainType as keyof typeof theme.colors],
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
                {`${formatHour(seg.startHour)}:00-${formatHour(
                  seg.endHour
                )}:00`}
              </div>
            </div>
          </SegmentItem>
        );
      })}
    </SegmentsContainer>
  );
};
