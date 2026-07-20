import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import PortalSelect from "./pages/PortalSelect";
import PortalAuth from "./pages/PortalAuth";
import PersonaRoute from "./components/PersonaRoute";
import PortalShell from "./components/PortalShell";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorAutoDm from "./pages/CreatorAutoDm";
import ComingSoon from "./pages/ComingSoon";
import BrandAnalytics from "./pages/BrandAnalytics";
import CreatorMediaKit from "./pages/CreatorMediaKit";
import CreatorInvoices from "./pages/CreatorInvoices";
import CreatorInvoiceDetail from "./pages/CreatorInvoiceDetail";
import CreatorInvoiceForm from "./pages/CreatorInvoiceForm";
import CreatorInsightRequests from "./pages/CreatorInsightRequests";
import { WorkspaceAuthorizationProvider } from "./context/WorkspaceAuthorizationContext";
import WorkspacePermissionGuard from "./components/WorkspacePermissionGuard";
import Footer from "./pages/Footer";
import BrandCollaborationRoute from "./components/BrandCollaborationRoute";
import PortalHomeRedirect from "./components/PortalHomeRedirect";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <WorkspaceProvider>
        <WorkspaceAuthorizationProvider>
        <Routes>
          <Route path="/" element={<PortalHomeRedirect />} />
          <Route path="/login" element={<PortalSelect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/legacy-login" element={<Login />} />
          <Route path="/creator/login" element={<PortalAuth persona="CREATOR" mode="login" />} />
          <Route path="/creator/register" element={<PortalAuth persona="CREATOR" mode="register" />} />
          <Route path="/brand/login" element={<PortalAuth persona="BRAND" mode="login" />} />
          <Route path="/brand/register" element={<PortalAuth persona="BRAND" mode="register" />} />
          <Route element={<PersonaRoute persona="CREATOR"><PortalShell persona="CREATOR" /></PersonaRoute>}>
            <Route path="/creator/dashboard" element={<CreatorDashboard />} />
            <Route path="/creator/media-kit" element={<CreatorMediaKit />} />
            <Route path="/creator/invoices" element={<CreatorInvoices />} />
            <Route path="/creator/invoices/new" element={<CreatorInvoiceForm />} />
            <Route path="/creator/invoices/:invoiceId" element={<CreatorInvoiceDetail />} />
            <Route path="/creator/invoices/:invoiceId/edit" element={<CreatorInvoiceForm />} />
            <Route path="/creator/auto-dm" element={<CreatorAutoDm />} />
            <Route path="/creator/insight-requests" element={<CreatorInsightRequests />} />
          </Route>
          <Route element={<PersonaRoute persona="BRAND"><PortalShell persona="BRAND" /></PersonaRoute>}>
            <Route path="/brand/discovery" element={<WorkspacePermissionGuard permission="CONNECTION_USE"><CreatorMarketplace /></WorkspacePermissionGuard>} />
            <Route path="/brand/lists" element={<WorkspacePermissionGuard permission="CREATOR_LIST_VIEW"><CreatorLists /></WorkspacePermissionGuard>} />
            <Route path="/brand/campaigns" element={<WorkspacePermissionGuard permission="CAMPAIGN_VIEW"><Campaigns /></WorkspacePermissionGuard>} />
            <Route path="/brand/campaigns/:campaignId" element={<WorkspacePermissionGuard permission="CAMPAIGN_VIEW"><CampaignDetails /></WorkspacePermissionGuard>} />
            <Route path="/brand/analytics" element={<BrandAnalytics />} />
          </Route>
          <Route path="/connected" element={<Connected />} />
          <Route path="/dashboard" element={<PortalHomeRedirect />} />
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
          <Route path="/settings/workspace" element={<ProtectedRoute><BrandCollaborationRoute><WorkspacePermissionGuard permission="WORKSPACE_VIEW"><WorkspaceSettings /></WorkspacePermissionGuard></BrandCollaborationRoute></ProtectedRoute>} />
          <Route path="/settings/members" element={<ProtectedRoute><BrandCollaborationRoute><WorkspacePermissionGuard permission="MEMBER_VIEW"><Members /></WorkspacePermissionGuard></BrandCollaborationRoute></ProtectedRoute>} />
          <Route path="/invitations" element={<ProtectedRoute><BrandCollaborationRoute><Invitations /></BrandCollaborationRoute></ProtectedRoute>} />
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
