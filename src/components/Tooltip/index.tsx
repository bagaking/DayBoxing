import React, { useEffect, useState, useRef } from "react";
import { TooltipProps } from "../../types";
import styled from "styled-components";
import { ThemeConfig } from "../../types";

export const TooltipContainerDiv = styled.div<{
  isLeaving: boolean;
  isTransitioning: boolean;
  theme: ThemeConfig;
}>`
  position: fixed;
  background: rgba(255, 255, 255, 0.98);
  padding: 20px;
  border-radius: ${(props) => props.theme.borderRadius * 2}px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  min-width: 320px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  opacity: ${(props) => (props.isLeaving ? 0 : 1)};
  transform: ${(props) =>
    props.isLeaving ? "translateY(10px)" : "translateY(0)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: ${(props) => (props.isTransitioning ? "none" : "auto")};
`;

export const TimeBlockDiv = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  font-weight: 600;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.25);
`;

export const PreviousDayBadgeDiv = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: normal;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const CommentSection = styled.div`
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.55);
  position: relative;
  padding-left: 14px;
  font-weight: 400;
  letter-spacing: 0.2px;

  &::before {
    content: '"';
    position: absolute;
    left: 0;
    top: 2px;
    font-size: 18px;
    line-height: 1;
    font-family: Georgia, serif;
    color: rgba(0, 0, 0, 0.15);
  }
`;

const useTooltipPosition = (
  initialPosition: { x: number; y: number },
  tooltipRef: React.RefObject<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const [position, setPosition] = useState(initialPosition);
  const [offset, setOffset] = useState({ x: 15, y: 15 });

  useEffect(() => {
    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    if (!tooltip || !container) return;

    const tooltipRect = tooltip.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const MARGIN = 20;
    let x = initialPosition.x + offset.x;
    let y = initialPosition.y + offset.y;

    // 计算相对于容器的位置
    const relativeX = x - containerRect.left;
    const relativeY = y - containerRect.top;

    // 水平方向调整
    if (relativeX + tooltipRect.width > containerRect.width - MARGIN) {
      x = containerRect.right - tooltipRect.width - MARGIN;
    }
    if (relativeX < MARGIN) {
      x = containerRect.left + MARGIN;
    }

    // 垂直方向调整
    if (relativeY + tooltipRect.height > containerRect.height - MARGIN) {
      y = containerRect.bottom - tooltipRect.height - MARGIN;
    }
    if (relativeY < MARGIN) {
      y = containerRect.top + MARGIN;
    }

    setPosition({ x, y });
  }, [initialPosition, offset]);

  return {
    position,
    setOffset,
  };
};

export const Tooltip: React.FC<
  TooltipProps & { containerRef: React.RefObject<HTMLDivElement> }
> = ({ data, position: initialPosition, theme, containerRef }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { position, setOffset } = useTooltipPosition(
    initialPosition,
    tooltipRef,
    containerRef
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<number>();
  const prevDataRef = useRef(data);
  const prevPositionRef = useRef(initialPosition);
  const [tooltipData, setTooltipData] = useState(data);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const hasDataChanged =
      data?.type !== prevDataRef.current?.type ||
      data?.hour !== prevDataRef.current?.hour ||
      data?.date !== prevDataRef.current?.date ||
      data?.comment !== prevDataRef.current?.comment;

    const hasPositionChanged =
      initialPosition.x !== prevPositionRef.current.x ||
      initialPosition.y !== prevPositionRef.current.y;

    if (data) {
      if ((hasDataChanged || hasPositionChanged) && isVisible) {
        setIsTransitioning(true);

        if (hasDataChanged) {
          setTooltipData(data);
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setOffset({ x: 15, y: 15 });
          });
        });

        timeoutRef.current = window.setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      } else {
        setOffset({ x: 15, y: 15 });
        setTooltipData(data);
      }

      setIsLeaving(false);
      setIsVisible(true);
      prevDataRef.current = data;
      prevPositionRef.current = initialPosition;
    } else {
      setIsLeaving(true);
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, initialPosition]);

  useEffect(() => {
    if (tooltipData && isVisible) {
      setIsLeaving(false);
    }
  }, [tooltipData?.type]);

  if (!isVisible || !tooltipData) return null;

  const getSegmentColor = (type: string) => {
    return theme.colors[type as keyof typeof theme.colors] || theme.colors.base;
  };

  const formatHour = (hour: number) => {
    const normalizedHour = hour < 0 ? hour + 24 : hour;
    const displayHour = String(Math.abs(normalizedHour)).padStart(2, "0");
    const isPreviousDay = hour < 0;

    return {
      displayHour,
      isPreviousDay,
    };
  };

  return (
    <TooltipContainerDiv
      ref={tooltipRef}
      isLeaving={isLeaving}
      isTransitioning={isTransitioning}
      theme={theme}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 时间和类型信息 */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <TimeBlockDiv
            style={{ backgroundColor: getSegmentColor(tooltipData.type) }}
          >
            {formatHour(tooltipData.hour).displayHour}
            {formatHour(tooltipData.hour).isPreviousDay && (
              <PreviousDayBadgeDiv theme={theme}>-1d</PreviousDayBadgeDiv>
            )}
          </TimeBlockDiv>

          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "4px",
                color: "rgba(0,0,0,0.75)",
              }}
            >
              {`${tooltipData.hour}:00`}
            </div>
            <div
              style={{
                color: "rgba(0,0,0,0.6)",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: getSegmentColor(tooltipData.type),
                }}
              />
              {tooltipData.type.charAt(0).toUpperCase() +
                tooltipData.type.slice(1)}
            </div>
          </div>
        </div>

        {/* Comment 区域 */}
        {tooltipData.comment && (
          <CommentSection>{tooltipData.comment}</CommentSection>
        )}

        {/* 分段信息 */}
        {tooltipData.segment && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "rgba(0,0,0,0.02)",
              borderRadius: theme.borderRadius,
              border: "1px solid rgba(0,0,0,0.05)",
              color: theme.colors.text,
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "14px",
                  color: "rgba(0,0,0,0.5)",
                  marginBottom: "4px",
                }}
              >
                Current Segment
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: theme.colors.text,
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    color: "rgba(0,0,0)",
                    backgroundColor: getSegmentColor(
                      tooltipData.segment.mainType
                    ),
                  }}
                />
                {`${tooltipData.segment.startHour}:00 - ${tooltipData.segment.endHour}:00`}
              </div>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>
                  Pattern
                </div>
                <div style={{ fontSize: "15px" }}>
                  {`${tooltipData.segment.type} ${
                    tooltipData.segment.secondaryType
                      ? `(${tooltipData.segment.mainType}-${tooltipData.segment.secondaryType})`
                      : `(${tooltipData.segment.mainType})`
                  }`}
                </div>
              </div>

              {/* 时间分布统计 */}
              <div>
                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>
                  Distribution
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {Object.entries(tooltipData.segment.distribution || {}).map(
                    ([type, ratio]) => (
                      <div
                        key={type}
                        style={{
                          flex:
                            typeof ratio === "number" ? ratio.toString() : "1",
                          height: "4px",
                          backgroundColor: getSegmentColor(type),
                          borderRadius: "2px",
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 快捷键提示 */}
        <div
          style={{
            fontSize: "12px",
            color: "rgba(0,0,0,0.4)",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <span>Press</span>
          {["S", "W", "B", "R"].map((key) => (
            <span
              key={key}
              style={{
                padding: "2px 6px",
                backgroundColor: "rgba(0,0,0,0.05)",
                borderRadius: "4px",
                fontSize: "11px",
              }}
            >
              {key}
            </span>
          ))}
          <span>to change type</span>
        </div>
      </div>
    </TooltipContainerDiv>
  );
};
