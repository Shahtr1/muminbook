import { Navigate, Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH } from '@/hooks/useAuth.js';

const AdminGuard = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData([AUTH]);

  // Ensure roles is an array before checking
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes('admin');

  if (!isAdmin) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
