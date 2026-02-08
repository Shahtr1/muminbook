import { Flex, Radio, Text } from '@chakra-ui/react';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const XRadio = ({ value, label, hasError }) => {
  const { border } = useSemanticColors();
  const borderColor = hasError ? border.error : border.default;

  const borderWidth = hasError ? '2px' : '1px';

  return (
    <Flex
      width="100%"
      borderWidth={borderWidth}
      borderStyle="solid"
      borderColor={borderColor}
      alignItems="center"
      height={{ base: '8', md: '10' }}
      borderRadius="sm"
      pl={{ base: '1', md: '2' }}
      pr={{ base: '3' }}
    >
      <Radio
        value={value}
        flexDirection="row-reverse"
        justifyContent="space-between"
        width="100%"
      >
        <Text fontSize="sm">{label}</Text>
      </Radio>
    </Flex>
  );
};
