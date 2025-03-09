import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box } from "@chakra-ui/react";
import { ProphetNode } from "@/components/layout/features/nodes/ProphetNode.jsx";
import { TextNode } from "@/components/layout/features/nodes/TextNode.jsx";
import { CaliphNode } from "@/components/layout/features/nodes/CaliphNode.jsx";
import useFamilyTree from "@/hooks/useFamilyTree.js";
import { createFamilyTree } from "@/utils/createFamilyTree.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";

const nodeTypes = {
  prophet: ProphetNode,
  text: TextNode,
  caliph: CaliphNode,
};

const createEdges = (nodes) => {
  return nodes
    .filter((node) => node.parent)
    .map((node) => ({
      id: `e${node.parent}-${node.id}`,
      source: node.parent,
      target: node.id,
      type: "smoothstep",
      style: { strokeDasharray: "5 5", stroke: "gray" },
    }));
};

export const FamilyTree = () => {
  return (
    <ReactFlowProvider>
      <FamilyTreeContent />
    </ReactFlowProvider>
  );
};

const FamilyTreeContent = () => {
  const { familyTree, isPending, isError } = useFamilyTree();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const { fitView, setCenter } = useReactFlow();

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  useEffect(() => {
    if (familyTree && familyTree.length > 0) {
      const formattedNodes = createFamilyTree(familyTree);
      const newEdges = createEdges(formattedNodes);

      setNodes(formattedNodes);
      setEdges(newEdges);
    }
  }, [familyTree]);

  function zoomToLowLevel() {
    const lowestNode = nodes.reduce((prev, curr) =>
      prev.position.y > curr.position.y ? prev : curr,
    );

    setCenter(lowestNode.position.x, lowestNode.position.y + 100, {
      zoom: 1.2,
      duration: 300,
    });
  }

  function zoomToFit() {
    setTimeout(() => {
      fitView({ duration: 300 });
    }, 400);
  }

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        zoomToFit();
      }, 300);
    }
  }, [nodes, fitView, setCenter]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  if (isPending) return <Loader />;

  if (isError) return <SomethingWentWrong />;

  return (
    <Box width="100%" height="100%">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={memoizedNodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls zoomSpeed={2} />
        <MiniMap pannable zoomable />
        <Background />
      </ReactFlow>
    </Box>
  );
};
