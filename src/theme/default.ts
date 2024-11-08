import { ThemeConfig } from "../types";

export const defaultTheme: ThemeConfig = {
  colors: {
    sleep: "#A78BFA", // 中紫色
    work: "#60A5FA", // 中蓝色
    life: "#34D399", // 中绿色
    relax: "#FBBF24", // 中黄色
    background: "#ffffff",
    text: "#1f2937",
  },
  cellSize: 40,
  gap: 2,
  borderRadius: 4,
};

// 提供一些预设的主题变体
export const lightTheme: Partial<ThemeConfig> = {
  colors: {
    sleep: "#DDD6FE", // 浅紫色
    work: "#BFDBFE", // 浅蓝色
    life: "#A7F3D0", // 浅绿色
    relax: "#FDE68A", // 浅黄色
    background: "#ffffff",
    text: "#1f2937",
  },
};

export const darkTheme: Partial<ThemeConfig> = {
  colors: {
    sleep: "#8B5CF6", // 亮紫色
    work: "#3B82F6", // 亮蓝色
    life: "#10B981", // 亮绿色
    relax: "#F59E0B", // 亮黄色
    background: "#1F2937",
    text: "#F9FAFB",
  },
};
