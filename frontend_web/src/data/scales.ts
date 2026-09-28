export type ScaleTone = "sage" | "oat" | "blush" | "mist" | "stone" | "clay" | "linen" | "fog";

export interface ScaleItem {
  id: string;
  index: number;
  name: string;
  abbr: string;
  tone: ScaleTone;
  blurb: string;
}

export const scales: ScaleItem[] = [
  {
    id: "les",
    index: 1,
    name: "生活事件量表",
    abbr: "LES",
    tone: "sage",
    blurb: "梳理近期生活变动与压力来源",
  },
  {
    id: "cbf-pi-b",
    index: 2,
    name: "中国大五人格问卷",
    abbr: "CBF-PI-B",
    tone: "oat",
    blurb: "了解稳定的性格倾向与行为风格",
  },
  {
    id: "aas",
    index: 3,
    name: "成人依恋量表",
    abbr: "AAS",
    tone: "blush",
    blurb: "觉察亲密关系中的安全感与连接方式",
  },
  {
    id: "psqi",
    index: 4,
    name: "匹兹堡睡眠质量指数",
    abbr: "PSQI",
    tone: "mist",
    blurb: "评估近一个月的睡眠质量与节律",
  },
  {
    id: "ssrs",
    index: 5,
    name: "社会支持评定量表",
    abbr: "SSRS",
    tone: "stone",
    blurb: "看见身边可依靠的支持与资源",
  },
  {
    id: "swls",
    index: 6,
    name: "生活满意度量表",
    abbr: "SWLS",
    tone: "clay",
    blurb: "感受对当下生活整体状态的评价",
  },
  {
    id: "pid-5-bf",
    index: 7,
    name: "DSM-5 人格量表简版",
    abbr: "PID-5-BF",
    tone: "linen",
    blurb: "探索人格特质维度的简要画像",
  },
  {
    id: "scl-90",
    index: 8,
    name: "SCL-90 症状自评量表",
    abbr: "SCL-90",
    tone: "fog",
    blurb: "回顾近期身心不适与情绪信号",
  },
];
