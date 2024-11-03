import React, { useRef } from "react";
import { HourData, HourType, ThemeConfig, HourChangeEvent } from "../../types";

export interface HourCellProps {
  hour: HourData;
  date: string;
  theme: ThemeConfig;
  editable: boolean;
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
  onChange?: (event: HourChangeEvent) => void;
  render?: (hour: HourData, date: string) => React.ReactNode;
  onHover?: (
    data: { hour: number; type: HourType; date: string } | null,
    event: React.MouseEvent
  ) => void;
}

export const HourCell: React.FC<HourCellProps> = ({
  hour,
  date,
  theme,
  editable,
  customTypes,
  onChange,
  render,
  onHover,
}) => {
  const getColor = (type: HourType): string => {
    if (customTypes && type in customTypes) {
      return customTypes[type].color;
    }
    return theme.colors[type as keyof typeof theme.colors] || theme.colors.base;
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (onHover) {
      onHover({ hour: hour.hour, type: hour.type, date }, e);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (onHover) {
      onHover(null, e);
    }
  };

  const handleClick = () => {
    if (!editable || !onChange) return;
    onChange({
      hour: hour.hour,
      date,
      oldType: hour.type,
      newType: hour.type,
    });
  };

  if (render) {
    return <>{render(hour, date)}</>;
  }

  return (
    <div
      className="hour-cell"
      style={{
        width: theme.cellSize,
        height: theme.cellSize,
        backgroundColor: getColor(hour.type),
        borderRadius: theme.borderRadius,
        cursor: editable ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.colors.text,
        fontSize: "0.8em",
        transition: "background-color 0.2s ease",
        userSelect: "none",
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hour.hour}
    </div>
  );
};
