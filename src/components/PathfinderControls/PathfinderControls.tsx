import { useRef } from "react";

import { MapViewerActions } from "../../reducers/mapReducer";
import { useIsKeyPressed } from "../../hooks/useIsKeyPressed";

import { useAppState, usePathfinderState } from "../../state";

import "./PathfinderControls.css";

export function PathfinderControls() {
  const { nextStep, resetSearch } = usePathfinderState();

  const isShiftPressed = useIsKeyPressed("Shift");

  function reset() {
    // If shift is pressed, will remove the start and target markers as well
    resetSearch(isShiftPressed);
  }

  const intervalId = useRef(0);
  function automaticSeach() {
    intervalId.current = setInterval(() => {
      nextStep();
    }, 50);
  }

  return (
    <div className="controls-layout pathfinder-controls">
      <button className="button" onClick={reset}>
        Reset
      </button>

      <button className="button" onClick={nextStep}>
        Next step
      </button>

      <button className="button" onClick={automaticSeach}>
        Automatic search
      </button>
    </div>
  );
}
