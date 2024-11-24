# DayBoxing

DayBoxing 是一个基于 React 的时间管理可视化组件库，它实现了 QH 分析法则，帮助你直观地展示和分析每日时间分配。

## 功能特性

- 🎯 基于 QH 分析法则
  - 支持 A/B/C/F 四段时间分析
  - 自动识别 Full/Mix/Balance/Chaos 四种时间段模式
  - 智能计算时间分布比例
- 🛠 灵活的配置选项
  - 支持多种时间模式定义方式
  - 可自定义主题和样式
  - 支持快捷键操作
- 📱 响应式设计
  - 支持水平/垂直布局
  - 自适应容器尺寸

## 安装

```bash
npm install @bagaking/dayboxing
# or yarn add @bagaking/dayboxing
# or pnpm add @bagaking/dayboxing
```

## 基础使用

### 快速开始

最简单的使用方式是通过时间类型数组定义模式：

```tsx
import { DayBoxing } from '@bagaking/dayboxing';

function App() {
  return (
    <DayBoxing 
      patterns={[
        // 每个字符串代表一个小时的时间类型
        ["sleep", "sleep", "sleep", "work", "work", "life", "relax"]
      ]}
      dates={["2024-03-15"]}
    />
  );
}
```

### 详细配置

使用对象方式可以定义更详细的时间块信息：

```tsx
const pattern = {
  startHour: -3,  // 从前一天 21:00 开始
  blocks: [
    { type: "sleep", duration: 8, comment: "Night sleep" }, 
    { type: "work", duration: 4, comment: "Morning focus" },
    { type: "life", duration: 1, comment: "Lunch break" },
    { type: "work", duration: 4, comment: "Afternoon work" },
    { type: "relax", duration: 4, comment: "Evening activities" }
  ]
};

function App() {
  return (
    <DayBoxing 
      patterns={[pattern]}
      dates={["2024-03-15"]}
      editable={true}
    />
  );
}
```

### 也可以使用混合的写法

```tsx
const pattern = {
  startHour: -3,  // 从前一天 21:00 开始
  blocks: [
    "sleep", "sleep", "sleep", "sleep", "sleep", "sleep",
    { type: "sleep", duration: 2, comment: "Dream" }, 
    { type: "work", duration: 4, comment: "Morning focus" },
    { type: "life", duration: 1, comment: "Lunch break" },
    { type: "work", duration: 4, comment: "Afternoon work" },
    { type: "relax", duration: 4, comment: "Evening activities" }
  ]
};
```

## 高级特性

### 主题定制

```tsx
const theme = {
  colors: {
    sleep: "#A78BFA",
    work: "#60A5FA",
    life: "#34D399",
    relax: "#FBBF24",
    background: "#ffffff",
    text: "#1f2937",
  },
  cellSize: 40,
  gap: 2,
  borderRadius: 4,
};

<DayBoxing theme={theme} {...props} />
```

### 快捷键配置

```tsx
const shortcuts = {
  s: "sleep",
  w: "work",
  l: "life",
  r: "relax"
};

<DayBoxing 
  shortcuts={shortcuts}
  editable={true}
  {...props} 
/>
```

### 自定义渲染

```tsx
const CustomHour = ({ hour, date }) => (
  <div className="hour-cell">
    <div className="time">{hour.hour}:00</div>
    {hour.comment && (
      <div className="comment">{hour.comment}</div>
    )}
  </div>
);

const CustomDateLabel = ({ date }) => (
  <div className="date-label">
    {new Date(date).toLocaleDateString()}
  </div>
);

<DayBoxing 
  renderHour={CustomHour}
  renderDateLabel={CustomDateLabel}
  {...props} 
/>
```

### 事件处理

```tsx
function App() {
  const handleHourChange = (event) => {
    const { hour, date, oldType, newType } = event;
    console.log(`Hour ${hour} changed: ${oldType} -> ${newType}`);
  };

  const handlePatternEdit = (event) => {
    const { date, type, payload } = event;
    console.log(`Pattern edited: ${type}`, payload);
  };

  return (
    <DayBoxing 
      onHourChange={handleHourChange}
      onPatternEdit={handlePatternEdit}
      {...props} 
    />
  );
}
```

## API 参考

### DayBoxing Props

| 属性 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| patterns | (DayPattern \| string[])[] | ✓ | - | 时间模式数组 |
| dates | string[] | ✓ | - | 日期数组 |
| direction | 'horizontal' \| 'vertical' | | 'horizontal' | 布局方向 |
| theme | ThemeConfig | | defaultTheme | 主题配置 |
| editable | boolean | | false | 是否可编辑 |
| shortcuts | Record<string, HourType> | | {} | 快捷映射 |
| showDateLabel | boolean | | true | 是否显示日期标签 |
| onHourChange | (event: HourChangeEvent) => void | | - | 时间类型变更回调 |
| onPatternEdit | (event: PatternEditEvent) => void | | - | 模式编辑回调 |
| renderHour | (hour: HourData, date: string) => ReactNode | | - | 自定义小时渲染 |
| renderDateLabel | (date: string) => ReactNode | | - | 自定义日期标签渲染 |

### 类型定义

```typescript
interface DayPattern {
  startHour?: number;
  blocks: Array<{
    type: HourType;
    duration: number;
    comment?: string;
  }>;
}

type HourType = "sleep" | "work" | "life" | "relax";

interface HourChangeEvent {
  hour: number;
  date: string;
  oldType: HourType;
  newType: HourType;
  comment?: string;
}

interface PatternEditEvent {
  date: string;
  type: "moveStart" | "addBlock" | "removeBlock" | "updateBlock";
  payload: any;
}
```

## Qh 分析策略

DayBoxing 基于 QH 分析法则，将一天划分为四个时间段（A/B/C/F），用于分析时间分配的合理性。

### 时间段划分

- **A 段**（7小时）：通常是完整的睡眠时间
- **B 段**（7小时）：通常是核心工作时间
- **C 段**（7小时）：混合时间段
- **F 段**（0-7小时）：灵活时间段，长度可变

### 时间段模式

每个时间段都会被自动分析并归类为以下模式之一：

- **Full Part (FP)**
  - 单一类型时间占比 ≥ 80%
  - 例如：S(fp) 表示整段都是睡眠时间

- **Mix Part (MP)**
  - 主导类型占比 60-80%
  - 次要类型至少 2 小时
  - 例如：W-B(mp) 表示以工作为主，基础活动为辅

- **Balance Part (BP)**
  - 两种类型各占比 ≥ 35%
  - 例如：W-R(bp) 表示工作和休息时间大致相当

- **Chaos Part (CP)**
  - 三种及以上类型各占比 ≥ 20%
  - 通常表示时间管理效率较低

### 分析规则

- A 段理想状态应为 S(fp)，否则表示睡眠时间不足
- B 段建议为 Mix Part，避免出现 Chaos Part
- C 段可以是任意类型，但不建议是 Chaos Part
- F 段长度可变（0-7小时），用于调节作息灵活性

```tsx
// 一个良好的时间分配示例
const pattern = {
  startHour: -3,  // 21:00 开始
  blocks: [
    { type: "sleep", duration: 8 },  // A段: S(fp)
    { type: "work", duration: 6 },   // B段: W-B(mp)
    { type: "life", duration: 1 },
    { type: "work", duration: 4 },   // C段: W-R(bp)
    { type: "relax", duration: 3, comment: "Evening activities" },
    { type: "relax", duration: 2 }   // F段: R(fp)
  ]
};
```

## License

MIT © [bagaking](./LICENSE)
