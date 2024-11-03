import React, { useEffect, useState, useRef } from "react";
import { TooltipProps } from "../../types";

export const Tooltip: React.FC<TooltipProps> = ({ data, position, theme }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<number>();
  const prevDataRef = useRef(data);
  const [tooltipData, setTooltipData] = useState(data);

  useEffect(() => {
    const hasDataChanged =
      data?.type !== prevDataRef.current?.type ||
      data?.hour !== prevDataRef.current?.hour ||
      data?.date !== prevDataRef.current?.date ||
      data?.segment?.type !== prevDataRef.current?.segment?.type;

    if (data && hasDataChanged) {
      setTooltipData(data);
      setIsLeaving(false);
      setIsVisible(true);
      prevDataRef.current = data;
    } else if (!data) {
      setIsLeaving(true);
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 150);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data]);

  useEffect(() => {
    if (tooltipData && isVisible) {
      setIsLeaving(false);
    }
  }, [tooltipData?.type]);

  if (!isVisible || !tooltipData) return null;

  const getSegmentColor = (type: string) => {
    return theme.colors[type as keyof typeof theme.colors] || theme.colors.base;
  };

  return (
    <div
      className="day-boxing-tooltip"
      style={{
        position: "fixed",
        left: position.x + 15,
        top: position.y + 15,
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
        transition: "all 0.2s ease",
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
            }}
          >
            {tooltipData.hour}
          </div>
          <div>
            <div
              style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}
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
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
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
