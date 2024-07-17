import "./App.css";

import { MapViewer } from "./components/MapViewer/MapViewer";
import { PathfinderControls } from "./components/PathfinderControls/PathfinderControls";
import { MapControls } from "./components/MapControls/MapControls";
import { useAppState } from "./state";
import { useEffect } from "react";

function App() {
  const appState = useAppState();
  useEffect(() => {
    appState.initializeMap(15, 10);
  }, []);

  return (
    <>
      <div className="controls">
        <MapControls />
        <PathfinderControls />
      </div>

      <MapViewer />
    </>
  );
}

export default App;
