import React, { useState } from "react";
import {
  DayData,
  ThemeConfig,
  AnalysisStatus,
  DEFAULT_HOUR_TYPES,
} from "../../types";
import { analyzeDayOverall } from "../../utils/qhAnalysis";
import styled from "styled-components";
import { CloseButton } from "./styles";

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.15);
    }
  }
`;

const OverlayContainer = styled.div<{
  theme: ThemeConfig;
  status: AnalysisStatus;
}>`
  position: absolute;
  top: 32px;
  left: 0px;
  right: 0;
  max-width: 720px;
  max-height: calc(100vh - 200px);
  overflow: auto;

  backdrop-filter: blur(24px) saturate(180%);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.85)
  );
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  border-radius: ${(props) => props.theme.borderRadius * 1.5}px;
  border: 1px solid
    ${(props) => (props.status === "warning" ? "#faad2044" : "#52c41a44")};
  padding: 12px;

  display: flex;
  flex-direction: column;
  gap: 20px;

  z-index: 1000;

  transform-origin: top;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:not([data-entering="true"]) {
    animation: float 10s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-19px);
    }
  }
`;

const TitleRow = styled.div<{ status: AnalysisStatus }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-right: 32px;

  .date {
    font-size: 20px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.88);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  }

  .title {
    color: ${(props) =>
      props.status === "warning" ? "rgb(250, 173, 20)" : "rgb(82, 196, 26)"};
    font-size: 13px;
    font-weight: 500;
    margin-right: auto;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
  }

  .duration {
    background: ${(props) =>
      props.status === "warning"
        ? "rgba(250, 173, 20, 0.1)"
        : "rgba(82, 196, 26, 0.1)"};
    color: ${(props) =>
      props.status === "warning" ? "rgb(250, 173, 20)" : "rgb(82, 196, 26)"};
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: inset 0 0 0 1px
      ${(props) =>
        props.status === "warning"
          ? "rgba(250, 173, 20, 0.2)"
          : "rgba(82, 196, 26, 0.2)"};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 20px;
`;

const StatCard = styled.div<{ color: string }>`
  padding: 12px;
  background: ${(props) => `${props.color}08`};
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid ${(props) => `${props.color}15`};

  &:hover {
    background: ${(props) => `${props.color}12`};
    transform: translateY(-1px);
  }

  .type {
    font-size: 11px;
    font-weight: 500;
    color: ${(props) => props.color};
    margin-bottom: 4px;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
  }

  .hours {
    font-size: 16px;
    font-weight: 600;
    color: ${(props) => props.color};
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
  }
`;

const AdviceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AdviceCategory = styled.div`
  h4 {
    font-size: 11px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
  }
`;

const AdviceList = styled.ul<{ type: "warning" | "suggestion" | "tip" }>`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    position: relative;
    padding: 8px 12px 8px 28px;
    font-size: 12px;
    line-height: 1.6;
    color: ${(props) => {
      switch (props.type) {
        case "warning":
          return "rgb(250, 173, 20)";
        case "suggestion":
          return "rgb(82, 196, 26)";
        case "tip":
          return "rgba(0, 0, 0, 0.65)";
      }
    }};
    background: ${(props) => {
      switch (props.type) {
        case "warning":
          return "rgba(250, 173, 20, 0.08)";
        case "suggestion":
          return "rgba(82, 196, 26, 0.08)";
        case "tip":
          return "rgba(0, 0, 0, 0.04)";
      }
    }};
    border-radius: 6px;
    margin-bottom: 4px;
    transition: all 0.2s ease;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.03);

    &:hover {
      background: ${(props) => {
        switch (props.type) {
          case "warning":
            return "rgba(250, 173, 20, 0.12)";
          case "suggestion":
            return "rgba(82, 196, 26, 0.12)";
          case "tip":
            return "rgba(0, 0, 0, 0.06)";
        }
      }};
      transform: translateX(4px);
    }

    &::before {
      content: ${(props) => {
        switch (props.type) {
          case "warning":
            return '"⚠"';
          case "suggestion":
            return '"💡"';
          case "tip":
            return '"💭"';
        }
      }};
      position: absolute;
      left: 10px;
      opacity: 0.8;
      font-size: 11px;
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(1px);
  z-index: 999;
`;

interface DayAnalysisTooltipProps {
  day: DayData;
  theme: ThemeConfig;
  isLeaving: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const DayAnalysisTooltip: React.FC<DayAnalysisTooltipProps> = ({
  day,
  theme,
  isLeaving,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const analysis = analyzeDayOverall(day);

  const stats = Object.fromEntries(
    DEFAULT_HOUR_TYPES.map((type) => [
      type,
      day.hours.filter((h) => h.type === type).length,
    ])
  );

  // Group advices by type
  const warningAdvices = analysis.advices.filter((a) => a.type === "warning");
  const suggestionAdvices = analysis.advices.filter(
    (a) => a.type === "suggestion"
  );
  const tipAdvices = analysis.advices.filter((a) => a.type === "tip");

  return (
    <>
      <Overlay onClick={onMouseLeave} />
      <OverlayContainer
        theme={theme}
        status={analysis.status}
        style={{ opacity: isLeaving ? 0 : 1 }}
        onMouseEnter={() => {
          setIsHovered(true);
          onMouseEnter?.();
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onMouseLeave?.();
        }}
      >
        <TitleRow status={analysis.status}>
          <span className="date">{day.date}</span>
          <span className="title">{analysis.title}</span>
          {analysis.stats && (
            <span className="duration">{analysis.stats.duration}h</span>
          )}
        </TitleRow>

        <ContentArea>
          <StatsGrid>
            {Object.entries(stats).map(([type, hours]) => (
              <StatCard
                key={type}
                color={theme.colors[type as keyof typeof theme.colors]}
              >
                <div className="type">{type}</div>
                <div className="hours">{hours}h</div>
              </StatCard>
            ))}
          </StatsGrid>

          <AdviceSection>
            {warningAdvices.length > 0 && (
              <AdviceCategory>
                <h4>需要注意</h4>
                <AdviceList type="warning">
                  {warningAdvices.map((advice, i) => (
                    <li key={i}>{advice.content}</li>
                  ))}
                </AdviceList>
              </AdviceCategory>
            )}

            {suggestionAdvices.length > 0 && (
              <AdviceCategory>
                <h4>建议优化</h4>
                <AdviceList type="suggestion">
                  {suggestionAdvices.map((advice, i) => (
                    <li key={i}>{advice.content}</li>
                  ))}
                </AdviceList>
              </AdviceCategory>
            )}

            {tipAdvices.length > 0 && (
              <AdviceCategory>
                <h4>小贴士</h4>
                <AdviceList type="tip">
                  {tipAdvices.map((advice, i) => (
                    <li key={i}>{advice.content}</li>
                  ))}
                </AdviceList>
              </AdviceCategory>
            )}
          </AdviceSection>
        </ContentArea>

        <CloseButton
          $isVisible={isHovered}
          onClick={onMouseLeave}
          aria-label="关闭分析面板"
        />
      </OverlayContainer>
    </>
  );
};
