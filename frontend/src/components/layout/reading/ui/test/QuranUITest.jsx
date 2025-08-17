import React from "react";
import { useReadingInfinite } from "@/hooks/reading/useReadings.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { QuranReader } from "@/components/layout/reading/ui/QuranReader.jsx";

export const QuranUITest = () => {
  const startValue = 1;

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isPending: isReadingPending,
    isError: isReadingError,
  } = useReadingInfinite({
    fileId: "quran",
    startType: "surah",
    startValue: startValue,
    limit: 50,
  });

  const flatData = data?.pages.flatMap((page) => page.data) ?? [];

  if (isReadingPending) return <Loader />;
  if (isReadingError) return <SomethingWentWrong />;

  return (
    <QuranReader
      data={flatData}
      fetchNextChunk={fetchNextPage}
      fetchPreviousChunk={fetchPreviousPage}
      hasNextChunk={hasNextPage}
      hasPreviousChunk={hasPreviousPage}
      isFetchingNextChunk={isFetchingNextPage}
      isFetchingPreviousChunk={isFetchingPreviousPage}
    />
  );
};
