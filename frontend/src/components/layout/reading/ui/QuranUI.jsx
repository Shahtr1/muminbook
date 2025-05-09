import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { useColorModeValue } from "@chakra-ui/react";

export const QuranUI = ({ fileId }) => {
  const frameColor = useColorModeValue("text.primary", "whiteAlpha.900");
  return <RdWrapperUI fileId={fileId}>hi</RdWrapperUI>;
};
