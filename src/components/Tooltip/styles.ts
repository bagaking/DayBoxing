import styled from "styled-components";
import { AnalysisStatus, ThemeConfig } from "../../types";

export const TooltipContainerDiv = styled.div<{
  $isLeaving?: boolean;
  $isTransitioning?: boolean;
  theme: ThemeConfig;
}>`
  position: fixed;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.65);
  padding: 20px;
  border-radius: ${(props) => props.theme.borderRadius * 2}px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  z-index: 1000;
  min-width: 320px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  opacity: ${(props) => (props.$isLeaving ? 0 : 1)};
  transform: ${(props) =>
    props.$isLeaving ? "translateY(10px)" : "translateY(0)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(255, 255, 255, 0.08),
      transparent 40%
    );
    z-index: 0;
  }

  &.entering {
    opacity: 0;
    transform: translate3d(0, -4px, 0) scale(0.98) rotateX(-5deg);
  }

  &.animating {
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      left 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      top 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.entered {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1) rotateX(0deg);
  }

  &:not(.entering):not(.leaving) {
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0% {
      transform: translate3d(0, 0, 0) rotateX(0deg);
    }
    50% {
      transform: translate3d(0, -4px, 0) rotateX(2deg);
    }
    100% {
      transform: translate3d(0, 0, 0) rotateX(0deg);
    }
  }
`;

export const TooltipContainer = styled(TooltipContainerDiv)`
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  pointer-events: auto;

  &:hover {
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  }
`;

export const TimeBlockDiv = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  font-weight: 600;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.25);
  pointer-events: none;
`;

export const PreviousDayBadgeDiv = styled.div<{ theme: ThemeConfig }>`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: normal;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: none;
`;

export const CommentSection = styled.div`
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.55);
  position: relative;
  padding-left: 14px;
  font-weight: 400;
  letter-spacing: 0.2px;
  pointer-events: none;

  &::before {
    content: '"';
    position: absolute;
    left: 0;
    top: 2px;
    font-size: 18px;
    line-height: 1;
    font-family: Georgia, serif;
    color: rgba(0, 0, 0, 0.15);
    pointer-events: none;
  }
`;

export const AnalysisHeader = styled.div<{
  status?: AnalysisStatus;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
  background: ${(props) =>
    props.status === "warning"
      ? "rgba(250, 173, 20, 0.05)"
      : props.status === "success"
      ? "rgba(82, 196, 26, 0.05)"
      : "transparent"};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: 12px;
`;

export const HeaderInfo = styled.div`
  flex: 1;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
`;

export const SegmentBadge = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.color};
  background: ${(props) => `${props.color}12`};
  box-shadow: inset 0 0 0 1px ${(props) => `${props.color}20`},
    0 2px 4px ${(props) => `${props.color}10`};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: inset 0 0 0 1px ${(props) => `${props.color}30`},
      0 4px 8px ${(props) => `${props.color}15`};
  }
`;

export const SegmentTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 1px;
`;

export const SegmentType = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
`;

export const Distribution = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
`;

export const DistributionBar = styled.div`
  display: flex;
  height: 2px;
  border-radius: 1px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.02);
  margin-bottom: 4px;
`;

export const DistributionSegment = styled.div<{ color: string; flex: string }>`
  flex: ${(props) => props.flex};
  background-color: ${(props) => props.color};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shine 2s infinite;
  }

  @keyframes shine {
    to {
      left: 200%;
    }
  }

  &:hover {
    transform: scaleY(2);
  }
`;

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.45);
`;

export const LegendItem = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 4px;
  background: ${(props) => `${props.color}08`};
  border-radius: 3px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => `${props.color}15`};
    transform: translateY(-1px);
  }

  &::before {
    content: "";
    width: 4px;
    height: 4px;
    background: ${(props) => props.color};
    border-radius: 1px;
  }
`;

export const CloseButton = styled.button<{ $isVisible: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.45);
  background: rgba(0, 0, 0, 0.02);
  border: none;
  cursor: pointer;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transform: ${(props) => (props.$isVisible ? "rotate(0)" : "rotate(-90deg)")};
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.85);
    transform: rotate(90deg);
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 12px;
    height: 1px;
    background: currentColor;
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }
`;
