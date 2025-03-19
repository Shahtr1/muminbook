import { Outlet, useLocation } from "react-router-dom";
import { ReadingHome } from "@/components/layout/reading/ReadingHome.jsx";

export const Reading = () => {
  const location = useLocation();
  const isReadingDetail = location.pathname !== "/reading";

  return (
    <>
      {!isReadingDetail && <ReadingHome />}
      <Outlet />
    </>
  );
};
