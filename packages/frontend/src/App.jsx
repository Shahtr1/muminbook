import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import { ResetPassword } from './pages/auth/ResetPassword.jsx';
import { AppContainer } from './components/layout/AppContainer.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Helmet } from 'react-helmet-async';
import { Terms } from '@/pages/company/Terms.jsx';
import { Cookies } from '@/pages/company/Cookies.jsx';
import { PrivacyPolicy } from '@/pages/company/PrivacyPolicy.jsx';
import ReverifyEmail from '@/pages/auth/ReverifyEmail.jsx';
import { Forbidden } from '@/pages/auth/Forbidden.jsx';
import { Features } from '@/pages/Features.jsx';
import { FamilyTree } from '@/components/layout/features/FamilyTree.jsx';
import AdminGuard from '@/AdminGuard.jsx';
import { Admin } from '@/pages/Admin.jsx';
import { SuperBoard } from '@/components/layout/admin/SuperBoard.jsx';
import { AdminFamilyTree } from '@/components/layout/admin/AdminFamilyTree.jsx';
import { FolderView } from '@/pages/reading/FolderView.jsx';
import { ReadingList } from '@/components/layout/reading/ReadingList.jsx';
import { RemoveTrailingSlash } from '@/utils/RemoveTrailingSlash.jsx';
import { ReadingLayout } from '@/pages/reading/ReadingLayout.jsx';
import { setNavigate } from '@/services/index.js';
import { Suhuf } from '@/pages/Suhuf.jsx';

export function getPageTitleFromPath(pathname) {
  // Normalize non-string inputs
  if (typeof pathname !== 'string') {
    if (pathname == null) pathname = '';
    else pathname = String(pathname);
  }

  // Split and filter out empty segments (handle multiple/trailing slashes)
  const pathSegments = pathname.split('/').filter(Boolean);
  const mainPath = pathSegments.length > 0 ? pathSegments[0] : 'home';

  // Capitalize first letter and return
  return `${mainPath.charAt(0).toUpperCase() + mainPath.slice(1)}`;
}

function App() {
  const navigate = useNavigate();
  setNavigate(navigate);

  const location = useLocation();

  const getPageTitle = () => {
    // Use the exported helper
    return getPageTitleFromPath(location.pathname);
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
      </Helmet>

      <RemoveTrailingSlash />

      <Routes>
        <Route path="/" element={<AppContainer />}>
          {/*/////////////////////////////////////////*/}
          {/* USER ROUTES */}
          {/*/////////////////////////////////////////*/}

          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />}></Route>

          <Route path="reading" element={<ReadingLayout />}>
            {/*/////////////////////////////////////////*/}
            {/* READING ROUTES */}
            {/*/////////////////////////////////////////*/}
            <Route index element={<ReadingList />} />
            <Route path="my-files/*" element={<FolderView />} />
            <Route path="trash/*" element={<FolderView />} />
          </Route>

          <Route path="suhuf/:id" element={<Suhuf />} />

          <Route path="features" element={<Features />}>
            <Route index element={<Navigate to="family-tree" />} />
            <Route path="family-tree" element={<FamilyTree />}></Route>
          </Route>

          <Route element={<AdminGuard />}>
            <Route path="admin" element={<Admin />}>
              {/*/////////////////////////////////////////*/}
              {/* ADMIN ROUTES */}
              {/*/////////////////////////////////////////*/}
              <Route index element={<Navigate to="superboard" />} />
              <Route path="superboard" element={<SuperBoard />}></Route>
              <Route path="features">
                <Route index element={<Navigate to="family-tree" />} />
                <Route path="family-tree" element={<AdminFamilyTree />} />
              </Route>
            </Route>
          </Route>
        </Route>

        {/*/////////////////////////////////////////*/}
        {/* AUTH ROUTES */}
        {/*/////////////////////////////////////////*/}

        <Route path="login" element={<Login />}></Route>
        <Route path="register" element={<Register />}></Route>
        <Route path="forbidden" element={<Forbidden />}></Route>
        <Route path="email/verify/:code" element={<VerifyEmail />}></Route>
        <Route path="email/reverify" element={<ReverifyEmail />}></Route>
        <Route path="password/forgot" element={<ForgotPassword />}></Route>
        <Route path="password/reset" element={<ResetPassword />}></Route>

        {/*/////////////////////////////////////////*/}
        {/* COMPANY ROUTES */}
        {/*/////////////////////////////////////////*/}

        <Route path="terms" element={<Terms />} />
        <Route path="cookies" element={<Cookies />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </>
  );
}

export default App;
