import { FamilyTreeSVG } from '@/components/svgs/FamilyTreeSVG.jsx';
import { SuhufSVG } from '@/components/svgs/SuhufSVG.jsx';
import { useOpenSuhuf } from '@/hooks/suhuf/useOpenSuhuf.js';

export const featureData = () => {
  const openSuhuf = useOpenSuhuf();
  return [
    {
      id: 'family-tree',
      label: 'Family Tree',
      icon: FamilyTreeSVG,
      link: '/features/family-tree',
    },
    {
      id: 'suhuf',
      label: 'Suhuf',
      icon: SuhufSVG,
      action: openSuhuf,
    },
  ];
};
