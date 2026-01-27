import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, useTheme } from '@chakra-ui/react';
import { ProphetNode } from '@/components/features/nodes/ProphetNode.jsx';
import { TextNode } from '@/components/features/nodes/TextNode.jsx';
import { CaliphNode } from '@/components/features/nodes/CaliphNode.jsx';
import useFamilyTree from '@/hooks/useFamilyTree.js';
import { createFamilyTree } from '@/utils/createFamilyTree.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { BannerNode } from '@/components/features/nodes/BannerNode.jsx';
import { FlagNode } from '@/components/features/nodes/FlagNode.jsx';

const nodeTypes = {
  prophet: ProphetNode,
  text: TextNode,
  caliph: CaliphNode,
  banner: BannerNode,
  flag: FlagNode,
};

const handlePositions = (parent, node) => {
  let sourceHandle;
  let targetHandle;
  if (parent.position.x < node.position.x) {
    sourceHandle = 'right';
    targetHandle = 'left';
  }
  if (parent.position.x > node.position.x) {
    sourceHandle = 'left';
    targetHandle = 'right';
  }
  if (parent.position.y < node.position.y) {
    sourceHandle = 'bottom';
    targetHandle = 'top';
  }
  if (parent.position.y > node.position.y) {
    sourceHandle = 'top';
    targetHandle = 'bottom';
  }
  return { sourceHandle, targetHandle };
};

const createEdges = (nodes, color) => {
  return nodes
    .filter((node) => node.parents && node.parents.length > 0)
    .flatMap((node) =>
      node.parents.map((parentId, index) => {
        const parent = nodes.find((n) => n.id === parentId);
        const { sourceHandle, targetHandle } = handlePositions(parent, node);

        const lineages = node.data?.lineages;

        return {
          id: `e${parentId}-${node.id}`,
          source: parentId,
          sourceHandle,
          target: node.id,
          targetHandle,
          type: 'smoothstep',
          style: {
            strokeDasharray: lineages[index] === 'indirect' ? '5 5' : 'none',
            stroke: color,
            strokeWidth: '1.5px',
          },
        };
      })
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

  const goto = (member) =>
    setCenter(member?.position.x + 100, member?.position.y + 100, {
      zoom: 1.2,
      duration: 1000,
    });

  const zoomedRef = useRef(false);

  const zoomToLastProphet = () => {
    if (zoomedRef.current) return;

    const lastProphet = nodes.find((node) => node.data.uuid === 'muhammad');
    if (lastProphet) {
      setTimeout(() => {
        goto(lastProphet);
        zoomedRef.current = true;
      }, 500);
    }
  };

  useEffect(() => {
    if (nodes.length > 0) {
      zoomToLastProphet();
    }
  }, [nodes, fitView, setCenter]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
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
