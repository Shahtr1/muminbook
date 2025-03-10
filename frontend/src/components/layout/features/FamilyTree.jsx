import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box, useTheme } from "@chakra-ui/react";
import { ProphetNode } from "@/components/layout/features/nodes/ProphetNode.jsx";
import { TextNode } from "@/components/layout/features/nodes/TextNode.jsx";
import { CaliphNode } from "@/components/layout/features/nodes/CaliphNode.jsx";
import useFamilyTree from "@/hooks/useFamilyTree.js";
import { createFamilyTree } from "@/utils/createFamilyTree.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { BannerNode } from "@/components/layout/features/nodes/BannerNode.jsx";

const nodeTypes = {
  prophet: ProphetNode,
  text: TextNode,
  caliph: CaliphNode,
  banner: BannerNode,
};

const createEdges = (nodes, color) => {
  return nodes
    .filter((node) => node.parents && node.parents.length > 0)
    .flatMap((node) =>
      node.parents.map((parentId, index) => {
        const parent = nodes.find((n) => n.id === parentId);
        if (!parent) return null;

        let sourceHandle, targetHandle;

        if (parent.position.x < node.position.x) {
          sourceHandle = "right";
          targetHandle = "left";
        }
        if (parent.position.x > node.position.x) {
          sourceHandle = "left";
          targetHandle = "right";
        }
        if (parent.position.y < node.position.y) {
          sourceHandle = "bottom";
          targetHandle = "top";
        }
        if (parent.position.y > node.position.y) {
          sourceHandle = "top";
          targetHandle = "bottom";
        }

        const lineage = node.data?.lineage;
        const lineages = Array.isArray(lineage)
          ? lineage
          : lineage
            ? [lineage]
            : [];

        return {
          id: `e${parentId}-${node.id}`,
          source: parentId,
          sourceHandle,
          target: node.id,
          targetHandle,
          type: "smoothstep",
          style: {
            strokeDasharray: lineages[index] === "indirect" ? "5 5" : "none",
            stroke: color,
            strokeWidth: "1.5px",
          },
        };
      }),
    )
    .filter(Boolean);
};

export const FamilyTree = () => {
  return (
    <ReactFlowProvider>
      <FamilyTreeContent />
    </ReactFlowProvider>
  );
};

const FamilyTreeContent = () => {
  const theme = useTheme();
  const { familyTree, isPending, isError } = useFamilyTree();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const { fitView, setCenter } = useReactFlow();

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  useEffect(() => {
    if (familyTree && familyTree.length > 0) {
      const formattedNodes = createFamilyTree(familyTree);
      const newEdges = createEdges(formattedNodes, `${theme.colors.node}`);

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
        // zoomToLowLevel();
        // zoomToFit();
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
        minZoom={0.1}
      >
        <Controls zoomSpeed={2} />
        <Background />
      </ReactFlow>
    </Box>
  );
};
