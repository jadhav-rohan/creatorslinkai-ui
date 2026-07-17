import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Connected from "./pages/Connected";
import SelectPage from "./pages/SelectPage";
import Discover from "./pages/Discover";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CreatorMarketplace from "./pages/CreatorMarketplace";
import CreatorLists from "./pages/CreatorLists";
import CreatorListDetails from "./pages/CreatorListDetails";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import Campaigns from "./pages/Campaigns";
import CampaignDetails from "./pages/CampaignDetails";
import Footer from "./pages/Footer";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <WorkspaceProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/connected" element={<Connected />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights/:igUserId"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-page"
            element={
              <ProtectedRoute>
                <SelectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator-marketplace"
            element={
              <ProtectedRoute>
                <CreatorMarketplace />
              </ProtectedRoute>
            }
          />
          <Route path="/creator-lists" element={<ProtectedRoute><CreatorLists /></ProtectedRoute>} />
          <Route path="/creator-lists/:listId" element={<ProtectedRoute><CreatorListDetails /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/campaigns/:campaignId" element={<ProtectedRoute><CampaignDetails /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        <Footer />
        </WorkspaceProvider>
      </HashRouter>
    </AuthProvider>
  );
}
