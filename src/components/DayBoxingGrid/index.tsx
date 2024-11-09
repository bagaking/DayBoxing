import React from "react";
import { DayRow } from "./DayRow";
import { DayBoxingGridProps, QHAnalysis } from "../../types";

export interface ExtendedDayBoxingGridProps extends DayBoxingGridProps {
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
  onHover?: (data: any, event: React.MouseEvent) => void;
  onSegmentHover?: (
    segment: QHAnalysis | null,
    event: React.MouseEvent
  ) => void;
}

export const DayBoxingGrid: React.FC<ExtendedDayBoxingGridProps> = ({
  data,
  direction,
  theme,
  showDateLabel,
  renderDateLabel,
  renderHour,
  onHourChange,
  editable,
  customTypes,
  onHover,
  onSegmentHover,
}) => {
  return (
    <div
      className="day-boxing-grid"
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "column" : "row",
        gap: theme.gap * 4,
      }}
    >
      {data.map((day) => (
        <DayRow
          key={day.date}
          day={day}
          direction={direction}
          theme={theme}
          showDateLabel={showDateLabel}
          renderDateLabel={renderDateLabel}
          renderHour={renderHour}
          onHourChange={onHourChange}
          editable={editable}
          customTypes={customTypes}
          onHover={onHover}
          onSegmentHover={onSegmentHover}
        />
      ))}
    </div>
  );
};
