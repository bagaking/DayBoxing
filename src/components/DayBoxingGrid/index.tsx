import React from "react";
import { DayBoxingGridProps } from "../../types";
import { DayRow } from "./DayRow";
import { DateTitle } from "./DateTitle";

export const DayBoxingGrid: React.FC<DayBoxingGridProps> = ({
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
  onDateTitleHover,
}) => {
  return (
    <div className="day-boxing-grid">
      {data.map((day) => (
        <div key={day.date} className="day-container">
          {showDateLabel && (
            <DateTitle
              day={day}
              theme={theme}
              onHover={onDateTitleHover}
              renderDateLabel={renderDateLabel}
            />
          )}
          <DayRow
            day={day}
            theme={theme}
            direction={direction}
            showDateLabel={false}
            renderHour={renderHour}
            onHourChange={onHourChange}
            editable={editable}
            customTypes={customTypes}
            onHover={onHover}
            onSegmentHover={onSegmentHover}
          />
        </div>
      ))}
    </div>
  );
};
