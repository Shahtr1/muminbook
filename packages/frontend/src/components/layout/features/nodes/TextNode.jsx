import {
  CommonTextNode,
  TreeNode,
} from '@/components/layout/features/nodes/TreeNode.jsx';

export const TextNode = ({ data }) => {
  return (
    <TreeNode>
      <CommonTextNode data={data} />
    </TreeNode>
  );
};
