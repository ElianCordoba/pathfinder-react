import { useRef, useState } from "react";
import { MapValues, NodeId, PathNode, Reached, Search } from "../shared";
import { search } from "../algos/breadthFirst";

export function useBreadthFirstSearch(map: MapValues, startNode: NodeId | null, finishNode: NodeId | null) {
  const [step, setStep] = useState(0);
  const [frontier, setFrontier] = useState<NodeId[]>([]);
  const [reached, setReached] = useState<Reached>(new Map());
  const [path, setPath] = useState<PathNode[] | undefined>([]);

  let currentSearch = useRef<Search>();
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
      currentSearch.current = search(map, startNode as any, finishNode as any);
    }

    const nextStep = currentSearch.current.next();

    if (nextStep.done) {
      searchDone.current = true;
      console.log("Search done");
      setPath(nextStep.value.path);
      return;
    }

    const { step, frontier, reached } = nextStep.value;

    setStep(step);
    setFrontier(frontier);
    setReached(reached);
  }

  function resetSearch() {
    setStep(0);
    setFrontier([]);
    setReached(new Map());
    setPath([]);
    currentSearch.current = undefined;
    searchDone.current = false;
  }

  return [step, frontier, reached, path, nextStep, resetSearch] as const;
}
