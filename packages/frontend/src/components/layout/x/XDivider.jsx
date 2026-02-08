import { Divider } from '@chakra-ui/react';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const XDivider = ({ orientation, height }) => {
  const { border } = useSemanticColors();
  return (
    <Divider
      orientation={orientation}
      height={height}
      backgroundColor={border.subtle}
    />
  );
};
