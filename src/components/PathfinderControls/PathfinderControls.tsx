import { useIsKeyPressed } from "../../hooks/useIsKeyPressed";
import { usePathfinderState } from "../../state";

import "./PathfinderControls.css";

export function PathfinderControls() {
  const { nextStep, resetSearch, automaticSearchRunning, startAutomaticSearch, stopAutomaticSearch } =
    usePathfinderState();

  const isShiftPressed = useIsKeyPressed("Shift");

  function reset() {
    // If shift is pressed, will remove the start and target markers as well
    resetSearch(isShiftPressed);
  }

  return (
    <div className="controls-layout pathfinder-controls">
      <button className="button" onClick={reset}>
        Reset
      </button>

      <button className="button" onClick={nextStep}>
        Next step
      </button>

      <button className="button" onClick={!automaticSearchRunning ? startAutomaticSearch : stopAutomaticSearch}>
        {!automaticSearchRunning ? "Start automatic search" : "Stop automatic search"}
      </button>
    </div>
  );
}
