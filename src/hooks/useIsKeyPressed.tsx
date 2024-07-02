import { useEffect, useState } from "react";

export function useIsKeyPressed(keyToTrack: string) {
  const [isKeyPressed, setIsKeyPressed] = useState(false);

  function trackKeyPressed(e: KeyboardEvent, newValue: boolean) {
    if (e.key === keyToTrack) {
      setIsKeyPressed(newValue);
    }
  }

  function listenShiftPressed() {
    document.addEventListener("keydown", (e) => trackKeyPressed(e, true));
    document.addEventListener("keyup", (e) => trackKeyPressed(e, false));
  }

  function removeShiftPressed() {
    document.removeEventListener("keydown", (e) => trackKeyPressed(e, true));
    document.removeEventListener("keyup", (e) => trackKeyPressed(e, false));
  }

  useEffect(() => {
    listenShiftPressed();
    return removeShiftPressed;
  }, []);

  return isKeyPressed;
}
