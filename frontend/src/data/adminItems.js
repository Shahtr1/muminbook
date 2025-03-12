import { FeaturesSVG } from "@/components/svgs/FeaturesSVG.jsx";
import { DashboardSVG } from "@/components/svgs/DashboardSVG.jsx";
import { FamilyTreeSVG } from "@/components/svgs/FamilyTreeSVG.jsx";

export const adminItems = () => [
  {
    id: "superboard",
    label: "Superboard",
    icon: DashboardSVG,
    link: "/admin/superboard",
  },
  {
    id: "features",
    label: "Features",
    icon: FeaturesSVG,
    link: "/admin/features",
    items: [
      { id: "family-tree", label: "FamilyTree", link: "/family-tree" },
      { id: "family-tree-2", label: "Normal Tree", link: "/family-tree" },
      { id: "family-tree-3", label: "Grained Tree", link: "/family-tree" },
    ],
  },
  {
    id: "sub-features",
    label: "Norms",
    icon: FamilyTreeSVG,
    link: "/admin/norms",
    items: [
      { id: "family-tree", label: "Greatest norm", link: "/family-tree" },
      { id: "family-tree-2", label: "Good norm", link: "/family-tree" },
      { id: "family-tree-3", label: "Fine norm", link: "/family-tree" },
    ],
  },
];
