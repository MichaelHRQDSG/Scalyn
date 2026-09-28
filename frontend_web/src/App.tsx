import { useState } from "react";

import type { ScaleItem } from "./data/scales";
import { CbfFlow } from "./components/cbf/CbfFlow";
import { LesFlow } from "./components/les/LesFlow";
import { PsqiFlow } from "./components/psqi/PsqiFlow";
import { ScaleHome } from "./components/ScaleHome";
import { SwlsFlow } from "./components/swls/SwlsFlow";

type AppView = "home" | "swls" | "les" | "cbf" | "psqi";

const OPEN_SCALE_IDS = new Set(["swls", "les", "cbf-pi-b", "psqi"]);

export default function App() {
  const [view, setView] = useState<AppView>("home");

  const handleSelectScale = (scale: ScaleItem) => {
    if (scale.id === "swls") {
      setView("swls");
      return;
    }
    if (scale.id === "les") {
      setView("les");
      return;
    }
    if (scale.id === "cbf-pi-b") {
      setView("cbf");
      return;
    }
    if (scale.id === "psqi") {
      setView("psqi");
    }
  };

  if (view === "swls") {
    return <SwlsFlow onBackHome={() => setView("home")} />;
  }

  if (view === "les") {
    return <LesFlow onBackHome={() => setView("home")} />;
  }

  if (view === "cbf") {
    return <CbfFlow onBackHome={() => setView("home")} />;
  }

  if (view === "psqi") {
    return <PsqiFlow onBackHome={() => setView("home")} />;
  }

  return <ScaleHome onSelectScale={handleSelectScale} openScaleIds={OPEN_SCALE_IDS} />;
}
