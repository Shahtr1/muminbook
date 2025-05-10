import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";
import { Flex } from "@chakra-ui/react";

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
      <Flex></Flex>
    </RdWrapperUI>
  );
};
