import { FamilyTreeSVG } from "@/components/svgs/FamilyTreeSVG.jsx";
import { SuhufSVG } from "@/components/svgs/SuhufSVG.jsx";
import { useNavigate } from "react-router-dom";
import { useCreateWindow } from "@/hooks/window/useCreateWindow.js";

export const featureItems = () => {
  const navigate = useNavigate();
  const { mutate: createWindow } = useCreateWindow();

  const openSuhuf = () => {
    const newSuhufId = crypto.randomUUID();
    createWindow(
      { type: "suhuf", typeId: newSuhufId },
      {
        onSuccess: (data) => {
          navigate(`/wn/${data._id}/suhuf`);
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
