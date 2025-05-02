import { SVG } from "@/components/svgs/SVG.jsx";

export const SplitHorizontalSVG = ({
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

      {/* Left panel with padding */}
      <rect
        x="4"
        y="4"
        width="6"
        height="16"
        rx="1"
        ry="1"
        fill={active ? activeColor : "none"}
        stroke={activeColor}
        strokeWidth="1"
      />

      {/* Right panel with padding */}
      <rect
        x="14"
        y="4"
        width="6"
        height="16"
        rx="1"
        ry="1"
        fill={active ? activeColor : "none"}
        stroke={activeColor}
        strokeWidth="1"
      />
    </SVG>
  );
};
