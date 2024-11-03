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

// Tooltip component
const Tooltip: React.FC<{
  data: HourTooltipData;
  position: { x: number; y: number };
  theme: ThemeConfig;
}> = ({ data, position, theme }) => (
  <div
    style={{
      position: "fixed",
      left: position.x + 10,
      top: position.y + 10,
      background: theme.colors.background,
      color: theme.colors.text,
      padding: "8px",
      borderRadius: theme.borderRadius,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      zIndex: 1000,
    }}
  >
    <div>{`Time: ${data.hour}:00`}</div>
    <div>{`Type: ${data.type}`}</div>
    {data.segment && (
      <div>{`Part: ${data.segment.type} (${data.segment.mainType}${
        data.segment.secondaryType ? `-${data.segment.secondaryType}` : ""
      })`}</div>
    )}
  </div>
);

// Hour Cell component
const HourCell: React.FC<{
  hour: HourData;
  date: string;
  theme: ThemeConfig;
  customTypes?: DayBoxingProps["customTypes"];
  onHover: (data: HourTooltipData | null) => void;
  onClick?: () => void;
}> = ({ hour, date, theme, customTypes, onHover, onClick }) => {
  // Get color based on hour type
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
      }}
      onClick={onClick}
      onMouseEnter={() => onHover({ hour: hour.hour, type: hour.type, date })}
      onMouseLeave={() => onHover(null)}
    >
      {hour.hour}
    </div>
  );
};

// Main DayBoxing component
export const DayBoxing: React.FC<DayBoxingProps> = ({
  data,
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
}) => {
  // Merge theme with default theme
  const theme = useMemo(
    () => ({ ...defaultTheme, ...customTheme }),
    [customTheme]
  );

  // State for tooltip
  const [tooltip, setTooltip] = useState<{
    data: HourTooltipData;
    position: { x: number; y: number };
  } | null>(null);

  // Use custom hook for data management
  const { data: daysData, updateHour } = useDayBoxingData({
    initialData: data,
    onChange: onHourChange,
  });

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent, date: string, hour: number, currentType: HourType) => {
      if (!editable || !tooltip) return;

      const key = e.key.toLowerCase();
      if (key in shortcuts) {
        e.preventDefault();
        updateHour(date, hour, shortcuts[key]);
      }
    },
    [editable, shortcuts, updateHour, tooltip]
  );

  // Handle hour click
  const handleHourClick = useCallback(
    (date: string, hour: number, currentType: HourType) => {
      if (!editable) return;

      const types = typeOrder || Object.keys(theme.colors);
      const currentIndex = types.indexOf(currentType);
      const nextType = types[(currentIndex + 1) % types.length];
      updateHour(date, hour, nextType);
    },
    [editable, theme.colors, typeOrder, updateHour]
  );

  // Effect for keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (tooltip) {
        handleKeyDown(
          e,
          tooltip.data.date,
          tooltip.data.hour,
          tooltip.data.type
        );
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKeyDown, tooltip]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "column" : "row",
        gap: theme.gap * 4,
      }}
    >
      {daysData.map((day) => (
        <div
          key={day.date}
          style={{
            display: "flex",
            flexDirection: direction === "horizontal" ? "row" : "column",
            alignItems: "center",
            gap: theme.gap * 2,
          }}
        >
          {showDateLabel && (
            <div style={{ minWidth: 100 }}>
              {renderDateLabel ? renderDateLabel(day.date) : day.date}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: theme.gap,
              flexWrap: "wrap",
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
                    onHover={(data) =>
                      data &&
                      setTooltip({
                        data: {
                          ...data,
                          segment: day.segments.find(
                            (s) =>
                              hour.hour >= s.startHour && hour.hour < s.endHour
                          ),
                        },
                        position: {
                          x: event?.pageX || 0,
                          y: event?.pageY || 0,
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
      ))}
      {tooltip && <Tooltip {...tooltip} theme={theme} />}
    </div>
  );
};
