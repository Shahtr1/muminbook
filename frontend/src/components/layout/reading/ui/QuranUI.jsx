import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";

// data
// hasNextPage
// hasPrevPage
// page
// pageSize
// total
// totalPages

export const QuranUI = ({ fileId, page }) => {
  const { data } = page;

  return (
    <RdWrapperUI fileId={fileId}>
      <SurahHeader rtl />
    </RdWrapperUI>
  );
};
