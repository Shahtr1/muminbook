import { Navigate } from "react-router-dom";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH } from "@/hooks/useAuth.js";

export const ProtectedRoute = ({ Component, allowedRoutes = [] }) => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData([AUTH]);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = user.roles?.some((role) => allowedRoutes.includes(role));

  return hasAccess ? <Component /> : <Navigate to="/forbidden" replace />;
};
