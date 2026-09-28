import { useState } from "react";

import type { ScaleItem } from "./data/scales";
import { ScaleHome } from "./components/ScaleHome";
import { SwlsFlow } from "./components/swls/SwlsFlow";

type AppView = "home" | "swls";

export default function App() {
  const [view, setView] = useState<AppView>("home");

  const handleSelectScale = (scale: ScaleItem) => {
    if (scale.id === "swls") {
      setView("swls");
    }
  };

  if (view === "swls") {
    return <SwlsFlow onBackHome={() => setView("home")} />;
  }

  return <ScaleHome onSelectScale={handleSelectScale} />;
}
