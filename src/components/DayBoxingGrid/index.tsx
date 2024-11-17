import React from "react";
import { DayBoxingGridProps } from "../../types";
import { DayRow } from "./DayRow";
import { DateTitle } from "./DateTitle";
import styled from "styled-components";

const GridContainer = styled.div<{ theme: any }>`
  .day-container {
    margin-bottom: ${(props) => props.theme.gap * 4}px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  color: ${(props) => props.theme.colors.text};
  background: ${(props) => props.theme.colors.background};
  transition: color 0.3s ease, background-color 0.3s ease;
`;

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
  typeOrder,
  onHover,
  onSegmentHover,
  onDateTitleClick,
}) => {
  return (
    <GridContainer theme={theme}>
      {data.map((day) => (
        <div key={day.date} className="day-container">
          {showDateLabel && (
            <DateTitle
              day={day}
              theme={theme}
              onClick={onDateTitleClick}
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
            typeOrder={typeOrder}
            onHover={onHover}
            onSegmentHover={onSegmentHover}
          />
        </div>
      ))}
    </GridContainer>
  );
};
