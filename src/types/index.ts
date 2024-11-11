// Hour types
export type BaseHourType = "sleep" | "work" | "life" | "relax";

// Support custom types
export type HourType = BaseHourType | string;

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
    background: string;
    text: string;
  };
  cellSize: number;
  gap: number;
  borderRadius: number;
}

// DayBoxingProps
export interface DayBoxingProps {
  patterns: DayPattern[];
  dates: string[];
  direction?: "horizontal" | "vertical";
  theme?: Partial<ThemeConfig>;
  showDateLabel?: boolean;
  renderHour?: (hour: HourData, date: string) => React.ReactNode;
  renderDateLabel?: (date: string) => React.ReactNode;
  onHourChange?: (event: HourChangeEvent) => void;
  onPatternEdit?: (event: PatternEditEvent) => void;
  editable?: boolean;
  shortcuts?: {
    [key: string]: HourType;
  };
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
  typeOrder?: HourType[];
}

// HourTooltipData
export interface HourTooltipData {
  hour: number;
  type: HourType;
  date: string;
  segment?: DaySegment;
  comment?: string;
}

// Data modification event
export interface HourChangeEvent {
  hour: number;
  date: string;
  oldType: HourType;
  newType: HourType;
  comment?: string;
}

// 添加新的类型定义
export interface DayBoxingGridProps {
  data: DayData[];
  direction: "horizontal" | "vertical";
  theme: ThemeConfig;
  showDateLabel: boolean;
  renderDateLabel?: (date: string) => React.ReactNode;
  renderHour?: (hour: HourData, date: string) => React.ReactNode;
  onHourChange?: (event: HourChangeEvent) => void;
  editable: boolean;
  customTypes?: {
    [key: string]: {
      color: string;
      label: string;
    };
  };
  onHover?: (data: HourTooltipData | null, event: React.MouseEvent) => void;
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
export interface TimeBlock {
  type: HourType;
  duration: number;
  comment?: string;
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

interface SegAnalysisTooltipProps {
  segment: QHAnalysis;
  allSegments: QHAnalysis[];
  days?: DayData[]; // 添加可选的历史数据
  position: { x: number; y: number };
  theme: ThemeConfig;
  isLeaving: boolean;
  isTransitioning: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// 添加 AnalysisStatus 类型
export type AnalysisStatus = "success" | "warning" | "normal";

// 添加 SegmentAnalysis 接口
export interface SegmentAnalysis {
  status: AnalysisStatus;
  message: string;
}

// 添加 AnalysisResult 接口
export interface AnalysisResult {
  type: "success" | "warning";
  title: string;
  advices: string[];
  stats: {
    duration: number;
    mainTypePercent: number;
    secondaryTypePercent: number;
  };
}
