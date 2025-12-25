import { SVG } from '@/components/svgs/SVG.jsx';
import { useColorModeValue, useToken } from '@chakra-ui/react';

export const SplitHorizontalSVG = ({
  active,
  activeColor,
  dimensions = '20px',
}) => {
  const [lightBg, darkBg] = useToken('colors', ['wn.bg.light', 'wn.bg.dark']);
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

      {/* Left panel with padding */}
      <rect
        x="3"
        y={active ? '2' : '4'}
        width="8"
        height={active ? '20' : '17'}
        rx="1"
        ry="1"
        fill={active ? activeColor : bgColor}
      />

      {/* Right panel with padding */}
      <rect
        x="13"
        y={active ? '2' : '4'}
        width="8"
        height={active ? '20' : '17'}
        rx="1"
        ry="1"
        fill={active ? activeColor : bgColor}
      />
    </SVG>
  );
};
