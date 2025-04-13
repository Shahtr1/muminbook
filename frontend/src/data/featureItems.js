import { FamilyTreeSVG } from "@/components/svgs/FamilyTreeSVG.jsx";
import { SuhufSVG } from "@/components/svgs/SuhufSVG.jsx";
import { useNavigate } from "react-router-dom";
import { useCreateSuhuf } from "@/hooks/suhuf/useCreateSuhuf.js";

export const featureItems = () => {
  const navigate = useNavigate();
  const { mutate: createSuhuf } = useCreateSuhuf();

  const openSuhuf = () => {
    createSuhuf(
      { title: "Untitled Suhuf" },
      {
        onSuccess: ({ windowId, suhufId }) => {
          navigate(`suhuf/${suhufId}`);
        },
      },
    );
  };

  return [
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
      action: openSuhuf,
    },
  ];
};
