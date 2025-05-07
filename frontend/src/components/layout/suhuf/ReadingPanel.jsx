import { Flex, useColorModeValue } from "@chakra-ui/react";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useReadingDetail } from "@/hooks/reading/useReadings.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { QuranUI } from "@/components/layout/reading/ui/QuranUI.jsx";

export const ReadingPanel = ({ id, page = 1 }) => {
  const bgColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );

  const { reading, isPending, isError, isSuccess } = useReadingDetail(id, page);

  const renderUI = () => {
    switch (id.toLowerCase()) {
      case "quran":
        return <QuranUI fileId={id} />;
      default:
        console.error(`No UI for reading type ${id}`);
        return <SomethingWentWrong />;
    }
  };

  return (
    <Flex height="100%" overflowY="auto" bgColor={bgColor} flexDir="column">
      {isPending && <Loader />}
      {isError && <SomethingWentWrong />}
      {isSuccess && renderUI()}
    </Flex>
  );
};
