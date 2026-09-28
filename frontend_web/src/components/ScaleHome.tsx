import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { scales, type ScaleItem } from "../data/scales";
import { Atmosphere } from "./Atmosphere";
import { ScaleCard } from "./ScaleCard";

export function ScaleHome() {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleSelect = (scale: ScaleItem) => {
    setNotice(`「${scale.name}」答题页稍后开放，当前先确认入口可用`);
  };

  return (
    <main className="page">
      <Atmosphere />
      <div className="shell">
        <motion.header
          className="brand-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="brand-mark">Scalyn</h1>
          <p className="brand-lead">在温和的节奏里，选择此刻想了解自己的量表。</p>
          <p className="brand-note">八个入口 · 单页专注 · 答题流程即将接入</p>
        </motion.header>

        <section className="scale-grid" aria-label="量表入口">
          {scales.map((scale, index) => (
            <ScaleCard key={scale.id} scale={scale} index={index} onSelect={handleSelect} />
          ))}
        </section>
      </div>

      <AnimatePresence>
        {notice ? (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.28 }}
          >
            {notice}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
