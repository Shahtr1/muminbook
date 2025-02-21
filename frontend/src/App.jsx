import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import { ResetPassword } from "./pages/ResetPassword.jsx";
import { AppContainer } from "./components/AppContainer.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { setNavigate } from "./lib/services/navigation.js";
import { PrivateRoute } from "./lib/services/PrivateRoute.jsx";
import { Settings } from "./pages/Settings.jsx";
import { Helmet } from "react-helmet-async";

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
        <Route path="/password/forgot" element={<ForgotPassword />}></Route>
        <Route path="/password/reset" element={<ResetPassword />}></Route>
      </Routes>
    </>
  );
}

export default App;
