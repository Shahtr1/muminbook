import { SVG } from "@/components/svgs/SVG.jsx";

export const SidebarLeftSVG = ({
  active,
  activeColor,
  dimensions = "20px",
}) => {
  return (
    <>
      <SVG
        dimensions={dimensions}
        active={active}
        activeColor={activeColor}
        viewBox="0 0 24 24"
      >
        <rect
          data-name="Square"
          fill="none"
          height="18"
          id="Square-2"
          rx="2"
          ry="2"
          stroke={activeColor}
          strokeMiterlimit="10"
          strokeWidth="1"
          width="18"
          x="3"
          y="3"
        />
        <rect
          data-name="Square"
          fill={active ? activeColor : "none"}
          height="18"
          id="Square-2"
          rx="2"
          ry="2"
          stroke={activeColor}
          strokeMiterlimit="10"
          strokeWidth="1"
          width="6"
          x="3"
          y="3"
        />
      </SVG>
    </>
  );
};
