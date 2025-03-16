import { Outlet, useLocation } from "react-router-dom";
import { VStack } from "@chakra-ui/react";
import { ReadingCard } from "@/components/layout/reading/ReadingCard.jsx";
import { readingItems } from "@/data/readingItems.js";

export const Reading = () => {
  const location = useLocation();
  const isReadingDetail = location.pathname !== "/reading";

  return (
    <>
      {!isReadingDetail && (
        <VStack spacing={4} align="stretch">
          {readingItems().map((item) => (
            <ReadingCard key={item.id} {...item} />
          ))}
        </VStack>
      )}

      <Outlet />
    </>
  );
};
