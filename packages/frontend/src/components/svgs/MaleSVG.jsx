import { SVG } from '@/components/svgs/SVG.jsx';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import {
  absoluteBoxStyles,
  absoluteSvgStyles,
} from '@/components/svgs/MaleFemaleCommonStyles.js';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const MaleSVG = ({ color, dimensions = '25px' }) => {
  const { surface } = useSemanticColors();
  const isMdScreen = useBreakpointValue({ base: true, md: false });
  const bgColor = surface.elevated;
  return (
    <Flex position="relative" height="100%" width="100%" overflow="hidden">
      <Box
        backgroundColor="brand.500"
        borderRadius="500px"
        position="absolute"
        {...absoluteBoxStyles(isMdScreen)}
      />
      <SVG
        dimensions={dimensions}
        activeColor={color ? color : 'white'}
        viewBox="0 0 508.609 508.609"
        absolute={true}
        absoluteStyles={absoluteSvgStyles(isMdScreen)}
      >
        <g>
          <circle cx="163.942" cy="159.364" r="36.959" />
          <circle cx="344.328" cy="159.364" r="36.959" />
        </g>
        <circle
          cx="254.135"
          cy="115.285"
          r="115.285"
          fill="#fff"
          stroke="#27A69F"
          strokeWidth="20"
        />
        <path
          d="M338.564,284.821H169.706c-77.309,0-140.037,62.728-140.037,140.037v83.751H478.94v-83.751
	C478.601,347.55,415.873,284.821,338.564,284.821z"
        />
        <circle
          cx="254.135"
          cy="271.936"
          r="62.728"
          fill="#fff"
          stroke="#27A69F"
          strokeWidth="20"
        />
        <path
          d="M330.766,74.257c-10.172,17.971-40.689,31.195-76.63,31.195s-66.458-13.224-76.63-31.195
	c-11.189,15.597-17.632,34.585-17.632,54.93v69.171c0,52.217,42.384,94.262,94.262,94.262s94.262-42.384,94.262-94.262v-68.832
	C348.397,108.842,341.955,89.854,330.766,74.257z"
        />
        <path
          d="M369.081,106.469C364.334,46.792,314.829,0,254.135,0S143.936,46.792,139.189,106.469H369.081z"
          fill="#fff"
          stroke="#27A69F"
          strokeWidth="20"
        />
      </SVG>
      {isMdScreen && (
        <Box
          height="13px"
          width="100%"
          bgColor={bgColor}
          position="absolute"
          bottom="0"
        ></Box>
      )}
    </Flex>
  );
};
