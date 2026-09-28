import { motion } from "framer-motion";

import type { ScaleItem } from "../data/scales";

interface ScaleCardProps {
  scale: ScaleItem;
  index: number;
  open: boolean;
  onSelect: (scale: ScaleItem) => void;
}

export function ScaleCard({ scale, index, open, onSelect }: ScaleCardProps) {
  return (
    <motion.button
      type="button"
      className="scale-card"
      data-tone={scale.tone}
      onClick={() => onSelect(scale)}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
    >
      <div className="scale-card__top">
        <span className="scale-card__index">{String(scale.index).padStart(2, "0")}</span>
        <span className="scale-card__abbr">{scale.abbr}</span>
      </div>
      <h2 className="scale-card__name">{scale.name}</h2>
      <p className="scale-card__blurb">{scale.blurb}</p>
      <div className="scale-card__footer">
        <span>{open ? "可开始作答" : "入口已准备"}</span>
        <span className="scale-card__cta">
          {open ? "进入" : "选择"}
          <span className="scale-card__cta-arrow" aria-hidden="true">
            →
          </span>
        </span>
      </div>
    </motion.button>
  );
}
