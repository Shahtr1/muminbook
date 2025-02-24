import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import { ResetPassword } from "./pages/auth/ResetPassword.jsx";
import { AppContainer } from "./components/AppContainer.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { setNavigate } from "./lib/services/navigation.js";
import { PrivateRoute } from "./lib/services/PrivateRoute.jsx";
import { Settings } from "./pages/Settings.jsx";
import { Helmet } from "react-helmet-async";
import { Terms } from "@/pages/official/Terms.jsx";
import { Cookies } from "@/pages/official/Cookies.jsx";
import { PrivacyPolicy } from "@/pages/official/PrivacyPolicy.jsx";
import ReverifyEmail from "@/pages/auth/ReverifyEmail.jsx";

function App() {
  const navigate = useNavigate();
  setNavigate(navigate);

  const location = useLocation();

  const getPageTitle = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const mainPath = pathSegments.length > 0 ? pathSegments[0] : "home";

    return `mb | ${mainPath.charAt(0).toUpperCase() + mainPath.slice(1)}`;
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<AppContainer />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="settings"
            element={
              <PrivateRoute Component={Settings} allowedRoutes={["admin"]} />
            }
          />
        </Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/email/verify/:code" element={<VerifyEmail />}></Route>
        <Route path="/email/reverify" element={<ReverifyEmail />}></Route>
        <Route path="/password/forgot" element={<ForgotPassword />}></Route>
        <Route path="/password/reset" element={<ResetPassword />}></Route>

        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </>
  );
}

export default App;
