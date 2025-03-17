import { Outlet, useLocation } from "react-router-dom";
import { ReadingList } from "@/components/layout/reading/ReadingList.jsx";

export const Reading = () => {
  const location = useLocation();
  const isReadingDetail = location.pathname !== "/reading";

  return (
    <>
      {!isReadingDetail && <ReadingList />}
      <Outlet />
    </>
  );
};
