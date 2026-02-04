import { GoEye, GoEyeClosed } from 'react-icons/go';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const XEyeIcon = ({ show }) => {
  const { icon } = useSemanticColors();
  const iconColor = icon.muted;

  return show ? <GoEyeClosed color={iconColor} /> : <GoEye color={iconColor} />;
};
