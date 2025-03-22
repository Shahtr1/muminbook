import { FamilyTreeSVG } from "@/components/svgs/FamilyTreeSVG.jsx";
import { SuhufSVG } from "@/components/svgs/SuhufSVG.jsx";

export const featureItems = () => [
  {
    id: "family-tree",
    label: "Family Tree",
    icon: FamilyTreeSVG,
    link: "/features/family-tree",
  },
  {
    id: "suhuf",
    label: "Suhuf",
    icon: SuhufSVG,
    link: "/features/suhuf",
  },
];
