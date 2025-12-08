import { SVG } from '@/components/svgs/SVG.jsx';
import {
  Box,
  Flex,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  absoluteBoxStyles,
  absoluteSvgStyles,
} from '@/components/svgs/MaleFemaleCommonStyles.js';

export const FemaleSVG = ({ color, dimensions = '25px' }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const isMdScreen = useBreakpointValue({ base: true, md: false });

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
        viewBox="0 0 512 512"
        absolute={true}
        absoluteStyles={absoluteSvgStyles(isMdScreen)}
      >
        <g>
          <path
            className="st0"
            d="M449.412,182.044C430.456,79.644,373.566,0,255.99,0C138.434,0,81.544,79.644,62.568,182.044
		C43.611,284.444,1.9,512,1.9,512h508.2C510.1,512,468.389,284.444,449.412,182.044z M381.156,234.545
		c0,33.844-27.433,61.278-61.278,61.278H192.123c-33.844,0-61.278-27.433-61.278-61.278v-44.911h250.311V234.545z"
          />
          <path
            className="st0"
            d="M201.767,257.912c10.478,0,18.966-8.489,18.966-18.967c0-10.478-8.489-18.967-18.966-18.967
		c-10.478,0-18.967,8.489-18.967,18.967C182.8,249.422,191.289,257.912,201.767,257.912z"
          />
          <path
            className="st0"
            d="M310.233,257.912c10.478,0,18.967-8.489,18.967-18.967c0-10.478-8.489-18.967-18.967-18.967
		c-10.478,0-18.967,8.489-18.967,18.967C291.266,249.422,299.756,257.912,310.233,257.912z"
          />
        </g>
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
