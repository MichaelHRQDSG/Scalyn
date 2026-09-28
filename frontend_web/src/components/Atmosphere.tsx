import { motion } from "framer-motion";

export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <motion.div
        className="atmosphere__blob atmosphere__blob--a"
        animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="atmosphere__blob atmosphere__blob--b"
        animate={{ y: [0, -16, 0], x: [0, -12, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      <motion.div
        className="atmosphere__blob atmosphere__blob--c"
        animate={{ y: [0, 12, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
    </div>
  );
}
