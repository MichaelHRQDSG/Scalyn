import scalesJson from "./scales.json";

export type ScaleTone = "sage" | "oat" | "blush" | "mist" | "stone" | "clay" | "linen" | "fog";

export interface ScaleItem {
  id: string;
  index: number;
  name: string;
  abbr: string;
  tone: ScaleTone;
  blurb: string;
}

export const scales = scalesJson as ScaleItem[];