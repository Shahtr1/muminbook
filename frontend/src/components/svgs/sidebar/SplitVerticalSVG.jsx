import { SVG } from "@/components/svgs/SVG.jsx";

export const SplitVerticalSVG = ({
  active,
  activeColor,
  dimensions = "20px",
}) => {
  return (
    <SVG
      dimensions={dimensions}
      active={active}
      activeColor={activeColor}
      viewBox="0 0 24 24"
    >
      {/* Outer container */}
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        ry="2"
        stroke={activeColor}
        strokeWidth="1"
        fill="none"
      />

      {/* Top panel with padding */}
      <rect
        x="4"
        y="4"
        width="16"
        height="6"
        rx="1"
        ry="1"
        fill={active ? activeColor : "none"}
        stroke={activeColor}
        strokeWidth="1"
      />

      {/* Bottom panel with padding */}
      <rect
        x="4"
        y="14"
        width="16"
        height="6"
        rx="1"
        ry="1"
        fill={active ? activeColor : "none"}
        stroke={activeColor}
        strokeWidth="1"
      />
    </SVG>
  );
};
