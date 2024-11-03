# DayBoxing

DayBoxing 是一个用于时间管理可视化的 React 组件库。它可以帮助你直观地展示和管理每天 24 小时的时间分配,支持多种作息模式(如普通、夜猫子、早起鸟等)的可视化展示。

## 特性

- 📊 可视化展示每天 21 ~ 28 小时的时间分配
- 🎨 支持多种预设主题(默认、浅色、深色)和自定义主题
- ⌨️ 支持快捷键操作(s/w/b/r)快速切换时间类型
- 📱 响应式设计,支持水平和垂直布局
- 🔄 支持实时编辑和更新时间块
- 🎯 支持 QH 分析法则,智能分析时间段特征

## 安装

使用 npm:

```bash
npm install @bagaking/dayboxing
```

使用 yarn:

```bash
yarn add @bagaking/dayboxing
```

使用 pnpm:

```bash
pnpm add @bagaking/dayboxing
```

## 基础用法

```tsx
import { DayBoxing } from '@bagaking/dayboxing';

// 定义一个基础的时间模式
const pattern = {
  startHour: 0, // 从当天0点开始
  blocks: [
    { type: "sleep", duration: 8 }, // 睡眠 8 小时
    { type: "work", duration: 9 },  // 工作 9 小时
    { type: "base", duration: 3 },  // 基础活动 3 小时
    { type: "relax", duration: 4 }, // 休闲 4 小时
  ],
};

const App = () => {
  return (
    <DayBoxing 
      patterns={[pattern]}
      dates={["2024-01-15"]}
      editable={true}
      shortcuts={{
        s: "sleep",
        w: "work",
        b: "base",
        r: "relax",
      }}
    />
  );
};
```

## 高级用法

### 自定义主题

```tsx
import { DayBoxing, lightTheme, darkTheme } from '@bagaking/dayboxing';

const App = () => {
  // 使用预设主题
  return <DayBoxing theme={lightTheme} {...otherProps} />;
  
  // 或自定义主题
  const customTheme = {
    colors: {
      sleep: "#A78BFA",
      work: "#60A5FA",
      base: "#34D399",
      relax: "#FBBF24",
      background: "#ffffff",
      text: "#1f2937",
    },
    cellSize: 40,
    gap: 2,
    borderRadius: 4,
  };
  
  return <DayBoxing theme={customTheme} {...otherProps} />;
};
```

### 快捷键支持

```tsx
const shortcuts = {
  s: "sleep",
  w: "work",
  b: "base",
  r: "relax",
};

<DayBoxing 
  shortcuts={shortcuts}
  editable={true}
  {...otherProps} 
/>
```

### 自定义渲染

```tsx
const renderHour = (hour, date) => (
  <div style={{ padding: '4px' }}>
    {hour.hour}:00 - {hour.type}
  </div>
);

const renderDateLabel = (date) => (
  <div style={{ fontWeight: 'bold' }}>
    {new Date(date).toLocaleDateString()}
  </div>
);

<DayBoxing 
  renderHour={renderHour}
  renderDateLabel={renderDateLabel}
  {...otherProps} 
/>
```

### 事件处理

```tsx
const handleHourChange = (event) => {
  console.log('Hour changed:', event);
  // event: { hour: number, date: string, oldType: string, newType: string }
};

const handlePatternEdit = (event) => {
  console.log('Pattern edited:', event);
  // event: { date: string, type: string, payload: object }
};

<DayBoxing 
  onHourChange={handleHourChange}
  onPatternEdit={handlePatternEdit}
  {...otherProps} 
/>
```

## API

### DayBoxing Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| patterns | DayPattern[] | - | 时间模式数组 |
| dates | string[] | - | 日期数组 |
| direction | 'horizontal' \| 'vertical' | 'horizontal' | 布局方向 |
| theme | Partial<ThemeConfig> | defaultTheme | 主题配置 |
| showDateLabel | boolean | true | 是否显示日期标签 |
| editable | boolean | false | 是否可编辑 |
| shortcuts | Record<string, HourType> | {} | 快捷键配置 |
| customTypes | Record<string, {color: string, label: string}> | - | 自定义时间类型 |
| typeOrder | HourType[] | - | 时间类型切换顺序 |
| onHourChange | (event: HourChangeEvent) => void | - | 小时变更回调 |
| onPatternEdit | (event: PatternEditEvent) => void | - | 模式编辑回调 |
| renderHour | (hour: HourData, date: string) => ReactNode | - | 自定义小时渲染 |
| renderDateLabel | (date: string) => ReactNode | - | 自定义日期标签渲染 |

## License

MIT © [bagaking](LICENSE)