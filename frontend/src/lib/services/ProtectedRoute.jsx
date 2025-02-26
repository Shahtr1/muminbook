import { Navigate } from "react-router-dom";
import React from "react";

export const ProtectedRoute = ({ Component, allowedRoutes = [] }) => {
  // const { user } = useAuth();
  //
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  const hasAccess = user.roles?.some((role) => allowedRoutes.includes(role));

  return hasAccess ? <Component /> : <Navigate to="/forbidden" replace />;
};
