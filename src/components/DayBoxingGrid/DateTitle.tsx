import React from "react";
import styled from "styled-components";
import { ThemeConfig, DayData } from "../../types";

interface DateTitleProps {
  day: DayData;
  theme: ThemeConfig;
  onHover?: (day: DayData | null, event: React.MouseEvent) => void;
  renderDateLabel?: (date: string) => React.ReactNode;
}

const DateTitleContainer = styled.div<{ theme: ThemeConfig }>`
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  padding: 6px 12px;
  margin-bottom: ${(props) => props.theme.gap * 2}px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
  position: relative;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    &::after {
      content: "查看当日分析";
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      white-space: nowrap;
    }
  }
`;

export const DateTitle: React.FC<DateTitleProps> = ({
  day,
  theme,
  onHover,
  renderDateLabel,
}) => {
  return (
    <DateTitleContainer
      theme={theme}
      onMouseEnter={(e) => onHover?.(day, e)}
      onMouseLeave={(e) => onHover?.(null, e)}
    >
      {renderDateLabel ? renderDateLabel(day.date) : day.date}
    </DateTitleContainer>
  );
};
