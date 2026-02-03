import {
  Box,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import {
  QURAN_DIVISION_LABELS,
  QURAN_DIVISION_TYPES,
} from '@/constants/QuranDivisionType.js';

export const QuranDivisionFilter = ({ value, onChange }) => {
  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');

  return (
    <Box
      bg={bgColor}
      w="100px"
      p={3}
      border="1px solid"
      borderColor={borderColor}
    >
      <Text fontSize="sm" fontWeight="semibold" mb={3}>
        Filter By
      </Text>

      <RadioGroup value={value} onChange={onChange}>
        <Stack spacing={2} fontSize="sm">
          {QURAN_DIVISION_TYPES.map((type) => (
            <Radio key={type} value={type}>
              {QURAN_DIVISION_LABELS[type]}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
    </Box>
  );
};
