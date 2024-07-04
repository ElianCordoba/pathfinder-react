import { useEffect, useMemo, useState } from "react";

import { Direction, Kind, MapValues, NodeId, PathNode, Reached } from "../../shared";

import Arrow from "../../assets/arrow.svg";
import "./MapViewer.css";

export function MapViewer({
  map,
  onNodeClick,
  startNode,
  finishNode,
  frontier,
  reached,
  path,
}: {
  map: MapValues;
  onNodeClick: (nodeId: NodeId) => void;
  startNode: NodeId | null;
  finishNode: NodeId | null;
  frontier: NodeId[];
  reached: Reached;
  path: PathNode[] | undefined;
}) {
  function handleClick(event: any) {
    const selectedTile = event.target.closest("div") as HTMLDivElement;
    const nodeId = selectedTile.id as any;

    if (!nodeId) {
      return;
    }

    onNodeClick(nodeId);
  }

  const numberOfColumns = useMemo(() => map[0].length, [map]);
  const numberOfRows = useMemo(() => map.length, [map]);

  function getNodeClasses(node: Kind, id: NodeId) {
    console.log("class render");
    let classes = "spot";

    if (node == Kind.Empty) {
      classes += " empty";
    } else if (node == Kind.Wall) {
      classes += " wall";
    }

    if (id == startNode) {
      classes += " start";
    } else if (id == finishNode) {
      classes += " finish";
    } else if (path?.find((p) => p.id === id)) {
      console.log("path hitted");
      classes += " path";
    } else if (frontier.find((f) => f === id)) {
      classes += " frontier";
    } else if (reached.has(id)) {
      classes += " reached";
    }

    return classes;
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

  const _map = useMemo(() => {
    console.log("Map memo", path);
    return map;
  }, [map, path]);

  // const [_map, _setMap] = useState(map);
  console.log("map render");
  return (
    <div
      className="map-container"
      style={{
        gridTemplateColumns: `repeat(${numberOfColumns}, 30px)`,
        gridTemplateRows: `repeat(${numberOfRows}, 30px)`,
      }}
      onClick={handleClick}
    >
      {_map.map((x, xIndex) => {
        return x.map((y, yIndex) => {
          const id = `${yIndex}-${xIndex}` as NodeId;

          const reachedNode = reached.get(id);

          const styles = reachedNode ? { transform: `rotate(${getArrowRotation(reachedNode.direction!)}deg)` } : {};

          return (
            <div id={id} key={id} className={getNodeClasses(y, id)}>
              {reachedNode && <img className={"arrow"} style={styles} src={Arrow} alt="" />}
              {/* {f ? f.direction : "no"} */}
            </div>
          );
        });
      })}
    </div>
  );
}
