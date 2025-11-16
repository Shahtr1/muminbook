import { SVG } from "@/components/svgs/SVG.jsx";
import { useColorModeValue, useToken } from "@chakra-ui/react";

export const SplitVerticalSVG = ({
  active,
  activeColor,
  dimensions = "20px",
}) => {
  const [lightBg, darkBg] = useToken("colors", ["wn.bg.light", "wn.bg.dark"]);
  const bgColor = useColorModeValue(lightBg, darkBg);
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
        y="2.5"
        width="20"
        height="20"
        rx="2"
        ry="2"
        fill={active ? bgColor : activeColor}
      />

      {/* Top panel with padding */}
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="7.5"
        rx="1"
        ry="1"
        fill={active ? activeColor : bgColor}
      />

      {/* Bottom panel with padding */}
      <rect
        x="3.5"
        y="13.5"
        width="17"
        height="7.5"
        rx="1"
        ry="1"
        fill={active ? activeColor : bgColor}
      />
    </SVG>
  );
};
