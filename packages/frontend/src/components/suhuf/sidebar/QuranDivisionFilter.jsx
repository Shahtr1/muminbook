import { Box, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';

import {
  QURAN_DIVISION_LABELS,
  QURAN_DIVISION_TYPES,
} from '@/constants/QuranDivisionType.js';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const QuranDivisionFilter = ({ value, onChange }) => {
  const { surface, border } = useSemanticColors();
  const bgColor = surface.base;
  const borderColor = border.light;

  return (
    <Box
      bg={bgColor}
      w="100px"
      p={3}
      border="1px solid"
      borderColor={borderColor}
    >
      <Box borderBottom="1px solid" borderColor={borderColor} pb={2} mb={2}>
        <Text fontSize="sm" fontWeight="semibold">
          Filter By
        </Text>
      </Box>

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
