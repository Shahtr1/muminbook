import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { Folder } from "@/components/layout/reading/resources/Folder.jsx";
import { ReadingCard } from "@/components/layout/reading/ReadingCard.jsx";
import { useNavigate } from "react-router-dom";
import { useIsMyFilesEmpty } from "@/hooks/resource/useIsMyFilesEmpty.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useReading } from "@/hooks/useReading.js";
import { QuranSVG } from "@/components/svgs/QuranSVG.jsx";
import { ArabicEnglishSVG } from "@/components/svgs/ArabicEnglishSVG.jsx";
import { BookSVG } from "@/components/svgs/BookSVG.jsx";
import { StorySVG } from "@/components/svgs/StorySVG.jsx";

export const ReadingList = () => {
  const readingSvgMap = {
    quran: QuranSVG,
    "sealed-nectar": StorySVG,
    "sahih-bukhari": StorySVG,
    "sahih-muslim": StorySVG,
    "sahih-international": ArabicEnglishSVG,
  };
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

      {readings.map((item) => {
        const SvgIcon = readingSvgMap[item.uuid] || BookSVG;
        return (
          <ReadingCard
            key={item._id}
            {...item}
            svg={<SvgIcon dimensions="50px" activeColor={item.color} />}
            width={itemWidth}
          />
        );
      })}
    </Flex>
  );
};
