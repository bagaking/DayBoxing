// Hour types
export type BaseHourType = "sleep" | "work" | "life" | "relax" | "improve";

// Support custom types
export type HourType = BaseHourType | string;

// 从 BaseHourType 类型中提取所有可能的值
const HOUR_TYPE_VALUES = ["sleep", "work", "life", "relax", "improve"] as const;
export const DEFAULT_HOUR_TYPES: readonly BaseHourType[] =
  Array.from(HOUR_TYPE_VALUES);

// 从 BaseHourType 中提取快捷键映射
type ShortcutMap = {
  [K in BaseHourType as K extends string ? K[0] : never]: K;
};

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  s: "sleep",
  w: "work",
  l: "life",
  r: "relax",
  i: "improve",
} as const;

// 添加时间相关的常量
export const TIME_CONSTANTS = {
  MIN_DAY_HOURS: 21,
  MAX_DAY_HOURS: 28,
  MIN_SLEEP_HOURS: 6,
  MAX_SLEEP_HOURS: 9,
  MIN_WORK_HOURS: 4,
  MAX_WORK_HOURS: 10,
  MAX_CONTINUOUS_WORK: 4,
  MAX_CONTINUOUS_IMPROVE: 4,
  MIN_LIFE_RATIO: 0.2,
} as const;

// Part types
export type PartType = "full" | "mix" | "balance" | "chaos";

// Day segment
export interface DaySegment {
  type: PartType;
  mainType: HourType;
  secondaryType?: HourType;
  startHour: number;
  endHour: number;
  distribution?: Record<string, number>;
}

// Hour data
export interface HourData {
  hour: number;
  type: HourType;
  comment?: string;
}

// 添加 HourTooltipData 接口
export interface HourTooltipData extends HourData {
  date: string;
  segment?: QHAnalysis;
  previousDay?: {
    type: HourType;
    comment?: string;
  };
}

// 添加 HourChangeEvent 接口
export interface HourChangeEvent extends Pick<HourData, "hour"> {
  date: string;
  oldType: HourType;
  newType: HourType;
  comment?: string;
}

// Day data
export interface DayData {
  date: string;
  hours: HourData[];
  segments: DaySegment[];
  qhSegments?: QHAnalysis[];
}

// Theme configuration
export interface ThemeConfig {
  colors: {
    sleep: string;
    work: string;
    life: string;
    relax: string;
    improve: string;
    background: string;
    text: string;
  };
  cellSize: number;
  gap: number;
  borderRadius: number;
}

// 基础共享属性
export interface BaseDayBoxingProps {
  direction?: "horizontal" | "vertical";
  theme?: ThemeConfig;
  style?: React.CSSProperties;
  showDateLabel?: boolean;
  renderHour?: (hour: HourData, date: string) => React.ReactNode;
  renderDateLabel?: (date: string) => React.ReactNode;
  onHourChange?: (event: HourChangeEvent) => void;
  editable?: boolean;
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
  typeOrder?: readonly HourType[];
}

// DayBoxing 组件属性
export interface DayBoxingProps extends BaseDayBoxingProps {
  patterns: DayPattern[];
  dates: string[];
  onPatternEdit?: (event: PatternEditEvent) => void;
  shortcuts?: {
    [key: string]: HourType;
  };
}

// DayBoxingGrid 组件属性
export interface DayBoxingGridProps
  extends Required<
    Pick<
      BaseDayBoxingProps,
      "direction" | "theme" | "showDateLabel" | "editable"
    >
  > {
  data: DayData[];
  renderDateLabel?: (date: string) => React.ReactNode;
  renderHour?: (hour: HourData, date: string) => React.ReactNode;
  onHourChange?: (event: HourChangeEvent) => void;
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
  typeOrder?: readonly HourType[];
  onHover?: HoverEventHandler;
  onSegmentHover?: SegmentHoverEventHandler;
  onDateTitleClick?: (day: DayData, event: React.MouseEvent) => void;
}

export interface HoverEventHandler {
  (
    data: HourTooltipData | null,
    event: React.MouseEvent,
    boundaryRef?: React.RefObject<HTMLDivElement>
  ): void;
}

export interface SegmentHoverEventHandler {
  (
    segment: QHAnalysis | null,
    event: React.MouseEvent,
    boundaryRef?: React.RefObject<HTMLDivElement>
  ): void;
}

export interface HourRenderProps {
  hour: HourData;
  date: string;
}

export type HourRenderer = (hour: HourData, date: string) => React.ReactNode;

export interface DayRowProps {
  day: DayData;
  theme: ThemeConfig;
  direction?: "horizontal" | "vertical";
  showDateLabel?: boolean;
  renderDateLabel?: (date: string) => React.ReactNode;
  renderHour?: HourRenderer; // 使用新的类型
  onHourChange?: (event: HourChangeEvent) => void;
  editable?: boolean;
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
  onHover?: HoverEventHandler;
  onSegmentHover?: SegmentHoverEventHandler;
}

export interface TooltipProps {
  data: HourTooltipData;
  position: { x: number; y: number };
  theme: ThemeConfig;
}

// 在已有的类型定义中添加
export type QHSegment = "A" | "B" | "C" | "F";

export interface QHAnalysis {
  segment: QHSegment;
  startHour: number;
  endHour: number;
  type: PartType;
  mainType: HourType;
  secondaryType?: HourType;
  mainTypeHours: number; // 主要类型的小时数
  secondaryTypeHours?: number; // 次要类型的小时数
  distribution?: Record<string, number>;
}

// 在已有的类型定义中添加
export interface TimeBlock extends Omit<HourData, "hour"> {
  duration: number;
}

export interface DayPattern {
  startHour: number;
  blocks: (TimeBlock | HourType)[];
}

// 添加编辑操作的事件类型
export interface PatternEditEvent {
  date: string;
  type: "moveStart" | "addBlock" | "removeBlock" | "updateBlock";
  payload: {
    startHour?: number;
    blockIndex?: number;
    block?: TimeBlock;
  };
}

// 基础 Segment Tooltip 状态
export interface BaseSegmentTooltipState {
  segment: QHAnalysis;
  allSegments: QHAnalysis[];
  days: DayData[];
  position: { x: number; y: number };
  isLeaving: boolean;
  isTransitioning: boolean;
}

// 扩展的 Tooltip Props
export interface SegmentTooltipProps extends BaseSegmentTooltipState {
  theme: ThemeConfig;
  containerRef?: React.RefObject<HTMLDivElement>;
  boundaryRef?: React.RefObject<HTMLDivElement>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// 添加 AnalysisStatus 类型
export type AnalysisStatus = "success" | "warning" | "info" | "fatal";

// 添加 SegmentAnalysis 接口
export interface SegmentAnalysis {
  status: AnalysisStatus;
  message: string;
}

// 添加新的分析相关类型
export interface AnalysisContext {
  day: DayData;
  segment?: QHAnalysis;
  allSegments: QHAnalysis[];
  historicalDays?: DayData[];
  stats?: {
    duration: number;
    mainTypePercent: number;
    secondaryTypePercent: number;
  };
}

export interface AnalysisRule {
  id: string;
  type: "overall" | "feature" | "segment";
  priority: number;
  condition: (context: AnalysisContext) => boolean;
  analyze: (context: AnalysisContext) => AnalysisResult;
}

export interface AdviceItem {
  type: "warning" | "suggestion" | "tip";
  content: string;
}

// 添加 AnalysisResult 接口
export interface AnalysisResult {
  status: AnalysisStatus;
  title: string;
  advices: AdviceItem[];
  details?: Record<string, any>;
  stats?: {
    duration: number;
    mainTypePercent: number;
    secondaryTypePercent: number;
  };
}
