import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";

export const QuranUI = ({ fileId }) => {
  return (
    <RdWrapperUI fileId={fileId}>
      <SurahHeader rtl />
    </RdWrapperUI>
  );
};
