import { DashboardSVG } from "@/components/svgs/DashboardSVG.jsx";
import { ReadingSVG } from "@/components/svgs/ReadingSVG.jsx";
import { FeaturesSVG } from "@/components/svgs/FeaturesSVG.jsx";
import { BellSVG } from "@/components/svgs/BellSVG.jsx";
import { FemaleSVG } from "@/components/svgs/FemaleSVG.jsx";
import { MaleSVG } from "@/components/svgs/MaleSVG.jsx";

export const navItems = (user) => [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: DashboardSVG,
    link: "/dashboard",
  },
  {
    id: "reading",
    label: "Reading",
    icon: ReadingSVG,
    link: "/reading",
  },
  {
    id: "features",
    label: "Features",
    icon: FeaturesSVG,
    link: "/features",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: BellSVG,
    link: "notifications",
  },
  {
    id: "user",
    label: "Me",
    icon: user?.gender === "female" ? FemaleSVG : MaleSVG,
    link: "account",
  },
];
