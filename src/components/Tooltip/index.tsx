import React, { useEffect, useState, useRef } from "react";
import { TooltipProps } from "../../types";

export const Tooltip: React.FC<TooltipProps> = ({
  data,
  position: initialPosition,
  theme,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<number>();
  const prevDataRef = useRef(data);
  const prevPositionRef = useRef(initialPosition);
  const [tooltipData, setTooltipData] = useState(data);
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const hasDataChanged =
      data?.type !== prevDataRef.current?.type ||
      data?.hour !== prevDataRef.current?.hour ||
      data?.date !== prevDataRef.current?.date;

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
            setCurrentPosition({
              x: initialPosition.x + 15,
              y: initialPosition.y + 15,
            });
          });
        });

        timeoutRef.current = window.setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      } else {
        setCurrentPosition({
          x: initialPosition.x + 15,
          y: initialPosition.y + 15,
        });
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
    <div
      className="day-boxing-tooltip"
      style={{
        position: "fixed",
        left: currentPosition.x,
        top: currentPosition.y,
        background: "rgba(255, 255, 255, 0.98)",
        color: theme.colors.text,
        padding: "20px",
        borderRadius: theme.borderRadius * 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 1000,
        minWidth: "320px",
        border: "1px solid rgba(0,0,0,0.1)",
        backdropFilter: "blur(8px)",
        opacity: isLeaving ? 0 : 1,
        transform: isLeaving ? "translateY(10px)" : "translateY(0)",
        transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                     transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        pointerEvents: isTransitioning ? "none" : "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 时间和类型信息 */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: getSegmentColor(tooltipData.type),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              color: "#fff",
              fontWeight: "bold",
              position: "relative",
            }}
          >
            {formatHour(tooltipData.hour).displayHour}
            {formatHour(tooltipData.hour).isPreviousDay && (
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  fontSize: "10px",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  fontWeight: "normal",
                }}
              >
                -1d
              </div>
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "4px",
                color: "rgba(0,0,0,0.6)",
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
    </div>
  );
};
