import { useRef, useState } from "react";
import { MapValues, NodeId, PathNode, VisitedNode, PathfinderSearch, PathfinderFunction } from "../shared";

export function usePathfinder(
  algorithm: PathfinderFunction,
  map: MapValues,
  startNode: NodeId | null,
  finishNode: NodeId | null
) {
  const [step, setStep] = useState(0);
  const [nodesToVisit, setNodesToVisit] = useState<PathNode[]>([]);
  const [nodesVisited, setNodesVisited] = useState<VisitedNode[]>([]);
  const [path, setPath] = useState<VisitedNode[]>([]);

  let currentSearch = useRef<PathfinderSearch>();
  let searchDone = useRef(false);
  function nextStep() {
    if (searchDone.current) {
      return;
    }
    if (!startNode || !finishNode) {
      console.log("Refused to start calculation as start and / or finish nodes are not set");
      return;
    }

    if (!currentSearch.current) {
      currentSearch.current = algorithm(map, startNode as any, finishNode as any);
    }

    const nextStep = currentSearch.current.next();

    if (nextStep.done) {
      searchDone.current = true;
      console.log("Search done");
      setPath(nextStep.value.path);
      return;
    }

    const { step, nodesToVisit, nodesVisited } = nextStep.value;

    setStep(step);
    setNodesToVisit(nodesToVisit);
    setNodesVisited(nodesVisited);
  }

  function resetSearch() {
    setStep(0);
    setNodesToVisit([]);
    setNodesVisited([]);
    setPath([]);
    currentSearch.current = undefined;
    searchDone.current = false;
  }

  return { step, nodesToVisit, nodesVisited, path, nextStep, resetSearch } as const;
}
