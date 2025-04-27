import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { Folder } from "@/components/layout/reading/resources/Folder.jsx";
import { ReadingCard } from "@/components/layout/reading/ReadingCard.jsx";
import { useNavigate } from "react-router-dom";
import { useIsMyFilesEmpty } from "@/hooks/resource/useIsMyFilesEmpty.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useReading } from "@/hooks/useReading.js";

export const ReadingList = () => {
  const gapSize = "25px";
  const itemWidth = useBreakpointValue({
    base: `100%`,
    sm: `calc(50% - ${gapSize})`,
    md: `calc(33.33% - ${gapSize})`,
    lg: `calc(25% - ${gapSize})`,
  });

  const navigate = useNavigate();
  const { emptyMyFiles, isMyFilesEmptyPending, isMyFilesEmptyError } =
    useIsMyFilesEmpty();
  const { readings, isReadingPending, isReadingError } = useReading();

  const isPending = isMyFilesEmptyPending || isReadingPending;
  const isError = isMyFilesEmptyError || isReadingError;

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong />;

  return (
    <Flex gap={gapSize} flexWrap="wrap" px={8} py={2}>
      <Folder
        onClick={() => navigate("my-files")}
        width={itemWidth}
        resource={{ empty: emptyMyFiles }}
      />

      {readings.map((item) => (
        <ReadingCard key={item.id} {...item} width={itemWidth} />
      ))}
    </Flex>
  );
};
