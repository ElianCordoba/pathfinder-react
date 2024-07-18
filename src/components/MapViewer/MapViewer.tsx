import { useMemo, useRef, useState } from "react";

import { Direction, Kind, NodeId } from "../../shared";

import Arrow from "../../assets/arrow.svg";
import "./MapViewer.css";
import { parseId } from "../../utils/utils";
import { useIsKeyPressed } from "../../hooks/useIsKeyPressed";
import { useAppState, usePathfinderState } from "../../state";

export function MapViewer() {
  const { map, mapInstance, startNode, targetNode, toggleNode } = useAppState();

  const { nodesToVisit, nodesVisited, path } = usePathfinderState();
  const isShiftPressed = useIsKeyPressed("Shift");

  function handleClick(event: any) {
    const selectedTile = event.target.closest("div") as HTMLDivElement;
    const nodeId = selectedTile.id as any;

    if (!nodeId) {
      return;
    }

    if (isShiftPressed) {
      // Toggle wall / empty
      toggleNode(nodeId);
    } else {
      const [x, y] = parseId(nodeId);
      // Set start / finish nodes
      const node = mapInstance.at(x, y);

      if (node === Kind.Wall || nodeId == startNode || nodeId == targetNode) {
        return;
      }

      if (!startNode) {
        useAppState.setState({ startNode: nodeId });
      } else if (!targetNode) {
        useAppState.setState({ targetNode: nodeId });
      }
    }
  }

  const numberOfColumns = useMemo(() => map[0].length, [map]);
  const numberOfRows = useMemo(() => map.length, [map]);

  function getNodeClasses(node: Kind, id: NodeId) {
    let classes = "spot";

    if (node == Kind.Empty) {
      classes += " empty";
    } else if (node == Kind.Wall) {
      classes += " wall";
    }

    if (id == startNode) {
      classes += " start";
    } else if (id == targetNode) {
      classes += " finish";
    } else if (path?.find((p) => p.id === id)) {
      classes += " path";
    } else if (nodesToVisit.find((f) => f.id === id)) {
      classes += " frontier";
    } else if (nodesVisited.has(id)) {
      classes += " reached";
    }

    return classes;
  }

  const _map = useMemo(() => map, [map, path]);

  // Dragging

  function handleOnDrag(event: any, id: NodeId) {
    event.preventDefault();

    if (id !== startNode && id !== targetNode) {
      return;
    }

    setDraggingNode(id);
    console.log("Dragging", id);
  }

  function handleOnDrop(event: any) {
    event.preventDefault();

    if (!draggingNode) {
      return;
    }

    const dropTarget = event.target.closest("div") as HTMLDivElement;

    if (!dropTarget || !dropTarget.classList.contains("spot")) {
      return;
    }

    const nodeId = dropTarget.id;

    if (!nodeId || nodeId === startNode || nodeId === targetNode) {
      return;
    }

    // TODO Pass to this component the map instance
    const [x, y] = parseId(nodeId);
    const node = map[y][x];

    if (node === Kind.Wall) {
      return;
    }

    console.log("Dropping", nodeId);
  }

  const [draggingNode, setDraggingNode] = useState<NodeId>();

  const gridRef = useRef<HTMLDivElement>(null);

  const height = gridRef.current?.clientHeight || 0;

  // -4 is the border
  const rawSize = Math.min(height / numberOfRows, window.innerWidth / numberOfColumns) - 4;

  // With min of 15px
  const size = Math.round(Math.max(15, rawSize));

  return (
    <div
      ref={gridRef}
      className="map-container"
      style={{
        height: "100%",
        gridTemplateColumns: `repeat(${numberOfColumns}, ${size}px)`,
        gridTemplateRows: `repeat(${numberOfRows}, ${size}px)`,
      }}
      onClick={handleClick}
    >
      {_map.map((x, xIndex) => {
        return x.map((y, yIndex) => {
          const id = `${yIndex}-${xIndex}` as NodeId;

          return (
            <div
              // onMouseDown={(e) => handleOnDrag(e, id)}
              // onMouseUp={handleOnDrop}
              id={id}
              key={id}
              className={getNodeClasses(y, id)}
            >
              {isShiftPressed && <NodeDebugInfo id={id} />}
            </div>
          );
        });
      })}
    </div>
  );
}

function NodeDebugInfo({ id }: { id: NodeId }) {
  const { nodesVisited, nodesToVisit } = usePathfinderState();

  const visitedNode = nodesVisited.get(id);
  const toVisitNode = nodesToVisit.find((f) => f.id === id);

  const cost = visitedNode?.fCost || toVisitNode?.fCost || undefined;

  let styles = {};

  if (visitedNode && visitedNode.direction) {
    styles = { transform: `rotate(${getArrowRotation(visitedNode.direction!)}deg)` };
  }

  return (
    <>
      {cost && <div>{cost}</div>}
      {visitedNode && <img className={"arrow"} style={styles} src={Arrow} alt="" />}
    </>
  );
}

function getArrowRotation(direction: Direction) {
  switch (direction) {
    case Direction.Up:
      return 0;
    case Direction.UpRight:
      return 45;
    case Direction.Right:
      return 90;
    case Direction.DownRight:
      return 135;
    case Direction.Down:
      return 180;
    case Direction.DownLeft:
      return 225;
    case Direction.Left:
      return 270;
    case Direction.UpLeft:
      return 315;
  }
}
