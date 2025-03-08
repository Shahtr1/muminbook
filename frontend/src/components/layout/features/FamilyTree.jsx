import React, { useCallback, useState } from "react";
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box } from "@chakra-ui/react";

// Prophet Family Tree JSON Data
const prophetTree = [
  {
    id: "1",
    data: { label: "Adam" },
    position: { x: 400, y: 50 },
    draggable: true,
  },
  {
    id: "2",
    data: { label: "Nuh (Noah)" },
    position: { x: 400, y: 150 },
    draggable: true,
    parent: "1",
  },
  {
    id: "3",
    data: { label: "Ibrahim (Abraham)" },
    position: { x: 400, y: 250 },
    draggable: true,
    parent: "2",
  },
  {
    id: "4",
    data: { label: "Ismail" },
    position: { x: 250, y: 350 },
    draggable: true,
    parent: "3",
  },
  {
    id: "5",
    data: { label: "Ishaq" },
    position: { x: 550, y: 350 },
    draggable: true,
    parent: "3",
  },
  {
    id: "6",
    data: { label: "Yaqub (Jacob)" },
    position: { x: 550, y: 450 },
    draggable: true,
    parent: "5",
  },
  {
    id: "7",
    data: { label: "Yusuf (Joseph)" },
    position: { x: 550, y: 550 },
    draggable: true,
    parent: "6",
  },
  {
    id: "8",
    data: { label: "Musa (Moses)" },
    position: { x: 700, y: 450 },
    draggable: true,
    parent: "5",
  },
  {
    id: "9",
    data: { label: "Isa (Jesus)" },
    position: { x: 850, y: 450 },
    draggable: true,
    parent: "5",
  },
  {
    id: "10",
    data: { label: "Muhammad (PBUH)" },
    position: { x: 400, y: 550 },
    draggable: true,
    parent: "3",
  },
];

// Function to create edges (connections)
const createEdges = (nodes) => {
  let edges = [];
  nodes.forEach((node) => {
    if (node.parent) {
      edges.push({
        id: `e${node.parent}-${node.id}`,
        source: node.parent,
        target: node.id,
        animated: true,
      });
    }
  });
  return edges;
};

// Family Tree Component
export const FamilyTree = () => {
  const [nodes, setNodes] = useState(prophetTree);
  const [edges, setEdges] = useState(createEdges(prophetTree));

  // Node movement handler
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  // Edge change handler (optional, if you want to update edges dynamically)
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  return (
    <Box width="100%" height="80vh">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap pannable zoomable />
        <Background />
      </ReactFlow>
    </Box>
  );
};
