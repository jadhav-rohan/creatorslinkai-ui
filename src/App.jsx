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
import FollowUps from "./pages/FollowUps";
import OutreachTemplates from "./pages/OutreachTemplates";
import Profile from "./pages/Profile";
import WorkspaceSettings from "./pages/WorkspaceSettings";
import Members from "./pages/Members";
import Invitations from "./pages/Invitations";
import AcceptInvitation from "./pages/AcceptInvitation";
import { WorkspaceAuthorizationProvider } from "./context/WorkspaceAuthorizationContext";
import WorkspacePermissionGuard from "./components/WorkspacePermissionGuard";
import Footer from "./pages/Footer";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <WorkspaceProvider>
        <WorkspaceAuthorizationProvider>
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
                <WorkspacePermissionGuard permission="ANALYTICS_VIEW"><Insights /></WorkspacePermissionGuard>
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
                <WorkspacePermissionGuard permission="CONNECTION_USE"><Discover /></WorkspacePermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator-marketplace"
            element={
              <ProtectedRoute>
                <WorkspacePermissionGuard permission="CONNECTION_USE"><CreatorMarketplace /></WorkspacePermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route path="/creator-lists" element={<ProtectedRoute><WorkspacePermissionGuard permission="CREATOR_LIST_VIEW"><CreatorLists /></WorkspacePermissionGuard></ProtectedRoute>} />
          <Route path="/creator-lists/:listId" element={<ProtectedRoute><WorkspacePermissionGuard permission="CREATOR_LIST_VIEW"><CreatorListDetails /></WorkspacePermissionGuard></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><WorkspacePermissionGuard permission="CAMPAIGN_VIEW"><Campaigns /></WorkspacePermissionGuard></ProtectedRoute>} />
          <Route path="/campaigns/:campaignId" element={<ProtectedRoute><WorkspacePermissionGuard permission="CAMPAIGN_VIEW"><CampaignDetails /></WorkspacePermissionGuard></ProtectedRoute>} />
          <Route path="/follow-ups" element={<ProtectedRoute><WorkspacePermissionGuard permission="OUTREACH_TASK_VIEW"><FollowUps /></WorkspacePermissionGuard></ProtectedRoute>} />
          <Route path="/settings/outreach-templates" element={<ProtectedRoute><WorkspacePermissionGuard permission="OUTREACH_TEMPLATE_VIEW"><OutreachTemplates /></WorkspacePermissionGuard></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings/workspace" element={<ProtectedRoute><WorkspacePermissionGuard permission="WORKSPACE_VIEW"><WorkspaceSettings /></WorkspacePermissionGuard></ProtectedRoute>} />
          <Route path="/settings/members" element={<ProtectedRoute><WorkspacePermissionGuard permission="MEMBER_VIEW"><Members /></WorkspacePermissionGuard></ProtectedRoute>} />
          <Route path="/invitations" element={<ProtectedRoute><Invitations /></ProtectedRoute>} />
          <Route path="/invitations/accept" element={<AcceptInvitation />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        <Footer />
        </WorkspaceAuthorizationProvider>
        </WorkspaceProvider>
      </HashRouter>
    </AuthProvider>
  );
}
