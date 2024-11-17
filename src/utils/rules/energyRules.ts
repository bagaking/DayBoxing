import {
  AnalysisRule,
  AnalysisContext,
  AnalysisResult,
  HourData,
  BaseHourType,
  AdviceItem,
} from "../../types";

/**
 * Energy Management Analysis Rules
 *
 * Based on cognitive load and energy management theories:
 *
 * 1. Activity Energy Levels:
 *    sleep  (0) - Passive recovery
 *    relax  (1) - Active recovery
 *    life   (2) - Routine activities
 *    work   (3) - High cognitive load
 *    improve(3) - High cognitive load
 *
 * 2. Transition Rules:
 *    - Avoid energy level jumps > 2 (e.g., sleep->work)
 *    - Use life activities as transitions
 *    - Group similar energy level activities
 *
 * References:
 * 1. Cognitive Load Theory (Kahneman)
 *    - System 1 vs System 2 thinking
 *    - Mental energy consumption
 *    - Attention allocation
 *
 * 2. Energy Management Theory (Loehr & Schwartz)
 *    - Physical energy
 *    - Emotional energy
 *    - Mental energy
 *    - Spiritual energy
 *
 * 3. Ultradian Rhythm Research
 *    - Natural energy cycles
 *    - Peak performance periods
 *    - Recovery requirements
 */

// 定义活动能量等级
const ACTIVITY_ENERGY: Record<BaseHourType, number> = {
  sleep: 0, // 被动恢复
  relax: 1, // 主动恢复
  life: 2, // 日常活动
  improve: 3, // 高认知负荷
  work: 3, // 高认知负荷
} as const;

// 分析活动序列的能量变化
const analyzeEnergyTransition = (hours: HourData[]) => {
  const transitions: {
    hour: number;
    from: BaseHourType;
    to: BaseHourType;
    energyJump: number;
  }[] = [];

  for (let i = 0; i < hours.length - 1; i++) {
    const currentType = hours[i].type as BaseHourType;
    const nextType = hours[i + 1].type as BaseHourType;
    const currentEnergy = ACTIVITY_ENERGY[currentType];
    const nextEnergy = ACTIVITY_ENERGY[nextType];
    const energyJump = Math.abs(nextEnergy - currentEnergy);

    if (energyJump > 1) {
      transitions.push({
        hour: hours[i + 1].hour,
        from: currentType,
        to: nextType,
        energyJump,
      });
    }
  }

  return transitions;
};

export const energyRules: AnalysisRule[] = [
  {
    id: "energy_transitions",
    type: "feature",
    priority: 85,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const transitions = analyzeEnergyTransition(ctx.day.hours);
      const advices: AdviceItem[] = [];

      // 分析能量跳跃
      transitions.forEach(({ hour, from, to, energyJump }) => {
        if (energyJump > 2) {
          advices.push({
            type: "warning",
            content: `在${hour}:00，从${from}直接切换到${to}，能量差异过大(${energyJump}级)。建议通过生活活动作为过渡，帮助身心调整到合适状态`,
          });
        } else if (energyJump === 2) {
          advices.push({
            type: "tip",
            content: `在${hour}:00，活动从${from}切换到${to}。建议预留5-10分钟的过渡时间，以便更好地适应新的活动`,
          });
        }
      });

      // 分析90分钟周期
      const highEnergyBlocks = ctx.day.hours.reduce(
        (blocks, hour, index, hours) => {
          if (hour.type === "work" || hour.type === "improve") {
            if (
              index === 0 ||
              (hours[index - 1].type !== "work" &&
                hours[index - 1].type !== "improve")
            ) {
              blocks.push([hour]);
            } else {
              blocks[blocks.length - 1].push(hour);
            }
          }
          return blocks;
        },
        [] as HourData[][]
      );

      highEnergyBlocks.forEach((block) => {
        if (block.length > 2) {
          const startHour = block[0].hour;
          const endHour = block[block.length - 1].hour;
          advices.push({
            type: "suggestion",
            content: `在${startHour}:00-${
              endHour + 1
            }:00期间连续进行高强度活动${
              block.length
            }小时。建议每90-120分钟安排15分钟休息，符合人体自然能量周期`,
          });
        }
      });

      // 检查能量分布
      const hoursByEnergy = ctx.day.hours.reduce((acc, hour) => {
        const energy = ACTIVITY_ENERGY[hour.type as BaseHourType];
        acc[energy] = (acc[energy] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // 检查高能量活动比例
      const highEnergyHours = hoursByEnergy[3] || 0;
      const totalHours = ctx.day.hours.length;
      if (highEnergyHours / totalHours > 0.5) {
        advices.push({
          type: "warning",
          content: `高能量活动占比${Math.round(
            (highEnergyHours / totalHours) * 100
          )}%(${highEnergyHours}小时)过高。建议增加中低强度活动，保持能量水平的可持续性`,
        });
      }

      // 添加能量管理建议
      advices.push({
        type: "tip",
        content:
          "合理的能量分配模式：早晨规划、上午专注、午后缓冲、傍晚总结。遵循这个节奏可以充分利用人体自然能量周期",
      });

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "能量转换分析",
        advices,
      };
    },
  },
];
