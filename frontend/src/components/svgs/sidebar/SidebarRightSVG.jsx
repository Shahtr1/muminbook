import { SVG } from "@/components/svgs/SVG.jsx";

export const SidebarRightSVG = ({
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
      <rect
        fill="none"
        height="18"
        rx="2"
        ry="2"
        stroke={activeColor}
        strokeWidth="1"
        width="18"
        x="3"
        y="3"
      />
      <rect
        fill={active ? activeColor : "none"}
        height="18"
        rx="2"
        ry="2"
        stroke={activeColor}
        strokeWidth="1"
        width="6"
        x="15"
        y="3"
      />
    </SVG>
  );
};
