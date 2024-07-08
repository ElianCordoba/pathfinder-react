import { HighlighterAction } from "../../reducers/highightedNodesReducer";
import { PathNode, VisitedNode } from "../../shared";

import "./DebugInfoViewer.css";

export function DebugInfoViewer({
  nodesToVisit,
  nodesVisited,
  highlightNode,
}: {
  nodesToVisit: PathNode[];
  nodesVisited: VisitedNode[];
  highlightNode: any;
}) {
  nodesVisited;

  function showInfo(nodeToVisit: PathNode) {
    highlightNode({
      type: HighlighterAction.ShowHighlight,
      currentNode: nodeToVisit.id,
      cameFromNode: "", //nodeToVisit.cameFrom, TODO
    });
  }

  function hideInfo() {
    highlightNode({ type: HighlighterAction.RemoveHighlight });
  }

  return (
    <div className="table-container">
      <div className="table" onMouseLeave={() => hideInfo()}>
        <h1>Nodes to visit</h1>
        <table>
          <tr>
            <th className="current">Id</th>
            <th className="came-from">Came from</th>
            <th>Cost</th>
          </tr>
          {nodesToVisit.map((nodeToVisit) => {
            return (
              <tr onMouseEnter={() => showInfo(nodeToVisit)} key={`${nodeToVisit.id}-${(nodeToVisit as any).cameFrom}`}>
                <td>{nodeToVisit.id}</td>
                {/* <td>{nodeToVisit.cameFrom}</td> */}
                <td>{nodeToVisit.cost}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
}
