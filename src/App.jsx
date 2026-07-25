import { HashRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import CreatorScripts from "./pages/CreatorScripts";
import CreatorScriptNew from "./pages/CreatorScriptNew";
import CreatorScriptDetail from "./pages/CreatorScriptDetail";
import { WorkspaceAuthorizationProvider } from "./context/WorkspaceAuthorizationContext";
import WorkspacePermissionGuard from "./components/WorkspacePermissionGuard";
import Footer from "./pages/Footer";
import BrandCollaborationRoute from "./components/BrandCollaborationRoute";
import PortalHomeRedirect from "./components/PortalHomeRedirect";
import { ThemedDialogProvider } from "./context/ThemedDialogContext";
import CheckEmail from "./pages/CheckEmail";
import VerifyEmail from "./pages/VerifyEmail";
import BrandPortalRouteGuard from "./components/BrandPortalRouteGuard";
import BrandComingSoon from "./pages/BrandComingSoon";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ThemedDialogProvider>
        <WorkspaceProvider>
        <WorkspaceAuthorizationProvider>
        <Routes>
          <Route path="/" element={<PortalHomeRedirect />} />
          <Route path="/login" element={<PortalSelect />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/legacy-login" element={<Navigate to="/login" replace />} />
          <Route path="/creator/login" element={<PortalAuth persona="CREATOR" mode="login" />} />
          <Route path="/creator/register" element={<PortalAuth persona="CREATOR" mode="register" />} />
          <Route path="/brand/coming-soon" element={<BrandComingSoon />} />
          <Route path="/brand/login" element={<BrandPortalRouteGuard><PortalAuth persona="BRAND" mode="login" /></BrandPortalRouteGuard>} />
          <Route path="/brand/register" element={<BrandPortalRouteGuard><PortalAuth persona="BRAND" mode="register" /></BrandPortalRouteGuard>} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<PersonaRoute persona="CREATOR"><PortalShell persona="CREATOR" /></PersonaRoute>}>
            <Route path="/creator/dashboard" element={<CreatorDashboard />} />
            <Route path="/creator/media-kit" element={<CreatorMediaKit />} />
            <Route path="/creator/invoices" element={<CreatorInvoices />} />
            <Route path="/creator/invoices/new" element={<CreatorInvoiceForm />} />
            <Route path="/creator/invoices/:invoiceId" element={<CreatorInvoiceDetail />} />
            <Route path="/creator/invoices/:invoiceId/edit" element={<CreatorInvoiceForm />} />
            <Route path="/creator/auto-dm" element={<CreatorAutoDm />} />
            <Route path="/creator/insight-requests" element={<CreatorInsightRequests />} />
            <Route path="/creator/scripts" element={<CreatorScripts />} />
            <Route path="/creator/scripts/new" element={<CreatorScriptNew />} />
            <Route path="/creator/scripts/:projectId" element={<CreatorScriptDetail />} />
            <Route path="/creator/profile" element={<Profile />} />
          </Route>
          <Route element={<BrandPortalRouteGuard><PersonaRoute persona="BRAND"><PortalShell persona="BRAND" /></PersonaRoute></BrandPortalRouteGuard>}>
            <Route path="/brand/discovery" element={<WorkspacePermissionGuard permission="CONNECTION_USE"><CreatorMarketplace /></WorkspacePermissionGuard>} />
            <Route path="/brand/lists" element={<WorkspacePermissionGuard permission="CREATOR_LIST_VIEW"><CreatorLists /></WorkspacePermissionGuard>} />
            <Route path="/brand/campaigns" element={<WorkspacePermissionGuard permission="CAMPAIGN_VIEW"><Campaigns /></WorkspacePermissionGuard>} />
            <Route path="/brand/campaigns/:campaignId" element={<WorkspacePermissionGuard permission="CAMPAIGN_VIEW"><CampaignDetails /></WorkspacePermissionGuard>} />
            <Route path="/brand/analytics" element={<WorkspacePermissionGuard permission="CAMPAIGN_VIEW"><BrandAnalytics /></WorkspacePermissionGuard>} />
            <Route path="/brand/profile" element={<Profile />} />
          </Route>
          <Route path="/connected" element={<Connected />} />
          <Route path="/dashboard" element={<PortalHomeRedirect />} />
          <Route
            path="/insights/:igUserId"
            element={
              <PersonaRoute persona="CREATOR">
                <WorkspacePermissionGuard permission="ANALYTICS_VIEW"><Insights /></WorkspacePermissionGuard>
              </PersonaRoute>
            }
          />
          <Route
            path="/select-page"
            element={
              <BrandPortalRouteGuard><PersonaRoute persona="BRAND">
                <SelectPage />
              </PersonaRoute></BrandPortalRouteGuard>
            }
          />
          <Route
            path="/discover"
            element={
              <BrandPortalRouteGuard><PersonaRoute persona="BRAND">
                <WorkspacePermissionGuard permission="CONNECTION_USE"><Discover /></WorkspacePermissionGuard>
              </PersonaRoute></BrandPortalRouteGuard>
            }
          />
          <Route
            path="/creator-marketplace"
            element={
              <BrandPortalRouteGuard><PersonaRoute persona="BRAND">
                <WorkspacePermissionGuard permission="CONNECTION_USE"><CreatorMarketplace /></WorkspacePermissionGuard>
              </PersonaRoute></BrandPortalRouteGuard>
            }
          />
          <Route path="/creator-lists" element={<BrandPortalRouteGuard><PersonaRoute persona="BRAND"><WorkspacePermissionGuard permission="CREATOR_LIST_VIEW"><CreatorLists /></WorkspacePermissionGuard></PersonaRoute></BrandPortalRouteGuard>} />
          <Route path="/creator-lists/:listId" element={<BrandPortalRouteGuard><PersonaRoute persona="BRAND"><WorkspacePermissionGuard permission="CREATOR_LIST_VIEW"><CreatorListDetails /></WorkspacePermissionGuard></PersonaRoute></BrandPortalRouteGuard>} />
          <Route path="/campaigns" element={<BrandPortalRouteGuard><PersonaRoute persona="BRAND"><WorkspacePermissionGuard permission="CAMPAIGN_VIEW"><Campaigns /></WorkspacePermissionGuard></PersonaRoute></BrandPortalRouteGuard>} />
          <Route path="/campaigns/:campaignId" element={<BrandPortalRouteGuard><PersonaRoute persona="BRAND"><WorkspacePermissionGuard permission="CAMPAIGN_VIEW"><CampaignDetails /></WorkspacePermissionGuard></PersonaRoute></BrandPortalRouteGuard>} />
          <Route path="/follow-ups" element={<BrandPortalRouteGuard><PersonaRoute persona="BRAND"><WorkspacePermissionGuard permission="OUTREACH_TASK_VIEW"><FollowUps /></WorkspacePermissionGuard></PersonaRoute></BrandPortalRouteGuard>} />
          <Route path="/settings/outreach-templates" element={<BrandPortalRouteGuard><PersonaRoute persona="BRAND"><WorkspacePermissionGuard permission="OUTREACH_TEMPLATE_VIEW"><OutreachTemplates /></WorkspacePermissionGuard></PersonaRoute></BrandPortalRouteGuard>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings/workspace" element={<BrandPortalRouteGuard><ProtectedRoute><BrandCollaborationRoute><WorkspacePermissionGuard permission="WORKSPACE_VIEW"><WorkspaceSettings /></WorkspacePermissionGuard></BrandCollaborationRoute></ProtectedRoute></BrandPortalRouteGuard>} />
          <Route path="/settings/members" element={<BrandPortalRouteGuard><ProtectedRoute><BrandCollaborationRoute><WorkspacePermissionGuard permission="MEMBER_VIEW"><Members /></WorkspacePermissionGuard></BrandCollaborationRoute></ProtectedRoute></BrandPortalRouteGuard>} />
          <Route path="/invitations" element={<BrandPortalRouteGuard><ProtectedRoute><BrandCollaborationRoute><Invitations /></BrandCollaborationRoute></ProtectedRoute></BrandPortalRouteGuard>} />
          <Route path="/invitations/accept" element={<BrandPortalRouteGuard><AcceptInvitation /></BrandPortalRouteGuard>} />
          <Route path="/invitations/respond" element={<BrandPortalRouteGuard><AcceptInvitation /></BrandPortalRouteGuard>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        <Footer />
        </WorkspaceAuthorizationProvider>
        </WorkspaceProvider>
        </ThemedDialogProvider>
      </HashRouter>
    </AuthProvider>
  );
}
