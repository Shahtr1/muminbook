import { Handle, Position } from "reactflow";
import { Fragment } from "react";

export const TreeNode = ({ children }) => {
  return (
    <>
      <Fragment>{children}</Fragment>
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
    </>
  );
};
