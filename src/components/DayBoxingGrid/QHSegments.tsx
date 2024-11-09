import React from "react";
import { QHAnalysis, ThemeConfig } from "../../types";
import styled from "styled-components";
import {
  getSegmentDescription,
  getSegmentTypeSymbol,
} from "../../utils/qhAnalysis";

interface QHSegmentsProps {
  segments: QHAnalysis[];
  theme: ThemeConfig;
  onSegmentHover?: (
    segment: QHAnalysis | null,
    event: React.MouseEvent
  ) => void;
}

export const SegmentsContainer = styled.div<{ theme: ThemeConfig }>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.gap}px;
  width: 150px;
`;

const SegmentItem = styled.div.attrs<{ theme: ThemeConfig }>((props) => ({
  style: {
    height: `${props.theme.cellSize}px`,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 8px",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: `${props.theme.borderRadius}px`,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    position: "relative",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
}))`
  &:hover {
    background-color: rgba(255, 255, 255, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  /* 添加一个微妙的点击效果 */
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
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
  transition: background-color 0.2s ease;

  ${SegmentItem}:hover & {
    background-color: ${(props) => `${props.color}25`};
  }
`;

export const SegmentLabel = styled.span<{ color: string }>`
  font-size: 11px;
  font-weight: 500;
  color: ${(props) => props.color};
  opacity: 0.8;
  padding: 0 2px;
  border-radius: 2px;
  transition: opacity 0.2s ease;

  ${SegmentItem}:hover & {
    opacity: 1;
  }
`;

export const TypeLabel = styled.span<{ color: string }>`
  font-size: 10px;
  font-weight: 600;
  color: ${(props) => props.color};
  opacity: 0.6;
  padding: 0 2px;
  border-radius: 2px;
  transition: opacity 0.2s ease;

  ${SegmentItem}:hover & {
    opacity: 0.8;
  }
`;

export const SegmentContent = styled.div`
  flex: 1;
  min-width: 0;
  transition: transform 0.2s ease;

  ${SegmentItem}:hover & {
    transform: translateX(2px);
  }
`;

export const SegmentTypes = styled.div<{ color: string }>`
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 1px;
  color: ${(props) => props.color};
  transition: color 0.2s ease;
`;

export const SegmentTime = styled.div`
  font-size: 9px;
  color: rgba(0, 0, 0, 0.45);
  font-family: monospace;
  transition: color 0.2s ease;

  ${SegmentItem}:hover & {
    color: rgba(0, 0, 0, 0.65);
  }
`;

export const QHSegments: React.FC<QHSegmentsProps> = ({
  segments,
  theme,
  onSegmentHover,
}) => {
  return (
    <SegmentsContainer theme={theme}>
      {segments.map((seg) => {
        const mainColor =
          theme.colors[seg.mainType as keyof typeof theme.colors];
        const typeSymbol = getSegmentTypeSymbol(seg);

        return (
          <SegmentItem
            key={seg.segment}
            theme={theme}
            onMouseEnter={(e) => onSegmentHover?.(seg, e)}
            onMouseLeave={(e) => onSegmentHover?.(null, e)}
          >
            <TypeBlock color={mainColor}>
              <SegmentLabel color={mainColor}>{seg.segment}</SegmentLabel>
              <TypeLabel color={mainColor}>{typeSymbol}</TypeLabel>
            </TypeBlock>

            <SegmentContent>
              <SegmentTypes color={mainColor}>
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
              </SegmentTypes>

              <SegmentTime>
                {`${seg.startHour}:00-${seg.endHour}:00`}
              </SegmentTime>
            </SegmentContent>
          </SegmentItem>
        );
      })}
    </SegmentsContainer>
  );
};
