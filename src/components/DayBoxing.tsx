import React, { useState, useCallback, useMemo } from "react";
import {
  DayBoxingProps,
  ThemeConfig,
  HourData,
  HourType,
  HourTooltipData,
} from "../types";
import { defaultTheme } from "../theme/default";
import { useDayBoxingData } from "../hooks/useDayBoxingData";
import { Tooltip } from "./Tooltip";

// Hour Cell component
const HourCell: React.FC<{
  hour: HourData;
  date: string;
  theme: ThemeConfig;
  customTypes?: DayBoxingProps["customTypes"];
  onHover: (data: HourTooltipData | null, event: React.MouseEvent) => void;
  onClick?: () => void;
}> = ({ hour, date, theme, customTypes, onHover, onClick }) => {
  const getColor = (type: HourType): string => {
    if (customTypes && type in customTypes) {
      return customTypes[type].color;
    }
    return theme.colors[type as keyof typeof theme.colors] || theme.colors.base;
  };

  return (
    <div
      style={{
        width: theme.cellSize,
        height: theme.cellSize,
        backgroundColor: getColor(hour.type),
        borderRadius: theme.borderRadius,
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.colors.text,
        fontSize: "0.8em",
        transition: "background-color 0.2s ease",
        userSelect: "none",
      }}
      onClick={onClick}
      onMouseEnter={(e) =>
        onHover({ hour: hour.hour, type: hour.type, date }, e)
      }
      onMouseLeave={(e) => onHover?.(null, e)}
    >
      {hour.hour}
    </div>
  );
};

// Main DayBoxing component
export const DayBoxing: React.FC<DayBoxingProps> = ({
  patterns,
  dates,
  direction = "horizontal",
  theme: customTheme = {},
  showDateLabel = true,
  renderHour,
  renderDateLabel,
  onHourChange,
  editable = false,
  shortcuts = {},
  customTypes,
  typeOrder,
  onPatternEdit,
}) => {
  const theme = useMemo(
    () => ({ ...defaultTheme, ...customTheme }),
    [customTheme]
  );

  const [tooltip, setTooltip] = useState<{
    data: HourTooltipData;
    position: { x: number; y: number };
  } | null>(null);

  const { data: daysData, updateHour } = useDayBoxingData({
    patterns,
    dates,
    onChange: onHourChange,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!editable || !tooltip) return;

      const key = e.key.toLowerCase();
      if (key in shortcuts) {
        e.preventDefault();
        updateHour(tooltip.data.date, tooltip.data.hour, shortcuts[key]);
      }
    },
    [editable, shortcuts, updateHour, tooltip]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleHourClick = useCallback(
    (date: string, hour: number, currentType: HourType) => {
      if (!editable) return;
      const types = typeOrder || ["sleep", "work", "base", "relax"];
      const currentIndex = types.indexOf(currentType);
      const nextType = types[(currentIndex + 1) % types.length];
      updateHour(date, hour, nextType);
    },
    [editable, typeOrder, updateHour]
  );

  return (
    <div className="day-boxing" style={{ padding: theme.gap * 2 }}>
      {daysData.map((day) => (
        <div
          key={day.date}
          style={{
            display: "flex",
            marginBottom: theme.gap * 4,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: theme.gap * 2,
              }}
            >
              {showDateLabel && (
                <div
                  style={{
                    minWidth: 100,
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {renderDateLabel ? renderDateLabel(day.date) : day.date}
                </div>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(7, ${theme.cellSize}px)`,
                gap: theme.gap,
              }}
            >
              {day.hours.map((hour) => (
                <React.Fragment key={hour.hour}>
                  {renderHour ? (
                    renderHour(hour, day.date)
                  ) : (
                    <HourCell
                      hour={hour}
                      date={day.date}
                      theme={theme}
                      customTypes={customTypes}
                      onHover={(data, event) =>
                        data &&
                        setTooltip({
                          data: {
                            ...data,
                            segment: day.segments.find(
                              (s) =>
                                data.hour >= s.startHour &&
                                data.hour < s.endHour
                            ),
                          },
                          position: {
                            x: event.pageX,
                            y: event.pageY,
                          },
                        })
                      }
                      onClick={() =>
                        handleHourClick(day.date, hour.hour, hour.type)
                      }
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          {day.qhSegments && (
            <div style={{ marginLeft: theme.gap * 4, minWidth: 200 }}>
              {day.qhSegments.map((segment) => (
                <div
                  key={segment.segment}
                  style={{
                    padding: theme.gap,
                    marginBottom: theme.gap,
                    border: `1px solid ${
                      theme.colors[
                        segment.mainType as keyof typeof theme.colors
                      ]
                    }`,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  <div>{`${segment.segment}: ${segment.startHour}:00-${segment.endHour}:00`}</div>
                  <div>{`${segment.type} (${segment.mainType}${
                    segment.secondaryType ? `-${segment.secondaryType}` : ""
                  })`}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {tooltip && <Tooltip {...tooltip} theme={theme} />}
    </div>
  );
};
