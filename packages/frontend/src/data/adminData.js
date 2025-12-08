import { FeaturesSVG } from "@/components/svgs/FeaturesSVG.jsx";
import { DashboardSVG } from "@/components/svgs/DashboardSVG.jsx";

export const adminData = () => [
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
      {
        id: "family-tree",
        label: "Family Tree",
        link: "/admin/features/family-tree",
      },
    ],
  },
];
