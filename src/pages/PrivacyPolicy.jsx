import {Link} from "react-router-dom";

const Section=({title,children})=><section><h2 className="mb-3 text-2xl font-black">{title}</h2><div className="space-y-4 leading-7 text-zinc-700">{children}</div></section>;
const List=({children})=><ul className="list-disc space-y-2 pl-6">{children}</ul>;

export default function PrivacyPolicy(){
 return <main className="brutal-page min-h-screen px-5 py-12 text-zinc-900 md:py-16"><article className="brutal-card mx-auto max-w-4xl p-6 md:p-10">
  <Link to="/login" className="text-sm font-black underline">← Back to CreatorLinksAI</Link>
  <p className="brutal-overline mt-8">Legal</p><h1 className="mt-2 text-4xl font-black md:text-5xl">Privacy Policy</h1>
  <p className="mt-3 text-sm text-zinc-600"><strong>Effective date:</strong> July 21, 2026</p>
  <div className="mt-10 space-y-10">
   <Section title="1. Scope"><p>This Privacy Policy explains how CreatorLinksAI collects, uses, stores, and shares information when creators, brands, agencies, and workspace members use our websites, portals, and connected services. It applies to both the Creator portal and the Brand/Agency portal.</p></Section>
   <Section title="2. Information we collect"><List>
    <li><strong>Account and profile information:</strong> email address, name, profile details, account persona, authentication and session information, and communication preferences.</li>
    <li><strong>Workspace information:</strong> workspace name and type, members, invitations, roles, permissions, and workspace settings.</li>
    <li><strong>Creator and campaign information:</strong> creator lists, public creator profile information, campaign records, commercial status, costs, notes, deliverables, contact details, outreach history, and follow-up records supplied by authorized users.</li>
    <li><strong>Creator business records:</strong> media-kit information and invoice details that creators choose to enter. Users should not include payment credentials or unnecessary sensitive information.</li>
    <li><strong>Meta connection information:</strong> Instagram or Facebook account and Page identifiers, usernames, connection status, media metadata, webhook events, and analytics made available through Meta's APIs. Meta access tokens are managed by the backend and are not intentionally exposed to the browser.</li>
    <li><strong>Creator-approved insights:</strong> deliverable-scoped metrics and snapshots shared by a creator after an explicit request. Approval does not grant a brand or agency access to the creator's private workspace or account-wide analytics.</li>
    <li><strong>Usage and security information:</strong> IP address, browser and device information, request identifiers, timestamps, error logs, rate-limit events, and activity needed to operate, secure, and troubleshoot the service.</li>
   </List><p>We do not ask for or store your Instagram or Facebook password.</p></Section>
   <Section title="3. How we use information"><List>
    <li>Authenticate users, maintain sessions, and keep Creator and Brand/Agency access separate.</li>
    <li>Provide workspaces, discovery, lists, campaigns, outreach records, deliverables, analytics, media kits, invoices, and Auto-DM tools.</li>
    <li>Connect to Meta services and perform actions a user requests or configures.</li>
    <li>Enforce permissions, prevent abuse, investigate security incidents, and comply with legal obligations.</li>
    <li>Maintain, support, measure, and improve CreatorLinksAI.</li>
   </List><p>Where applicable law requires a legal basis, we process information to perform our agreement with you, based on legitimate interests such as security and service improvement, with consent where requested, or to comply with law.</p></Section>
   <Section title="4. How information is shared"><p>We do not sell personal information. We may share information:</p><List>
    <li>With authorized members of the workspace in which the information is stored, according to their permissions.</li>
    <li>With Meta Platforms and other integrations when necessary to provide a feature you request.</li>
    <li>With hosting, infrastructure, monitoring, email, and support providers acting on our behalf under appropriate obligations.</li>
    <li>When required by law, to protect rights and safety, investigate misuse, or in connection with a corporate transaction.</li>
   </List><p>Public Instagram Business or Creator information returned by discovery may be visible to authorized Brand/Agency workspace users.</p></Section>
   <Section title="5. Cookies and session security"><p>CreatorLinksAI uses authentication cookies and related browser storage to maintain sessions, remember the selected workspace, and support connection flows. Access tokens are kept in application memory where supported. Signing out of CreatorLinksAI ends the application session but does not disconnect Instagram or Facebook.</p></Section>
   <Section title="6. Retention and deletion"><p>Retention depends on the type of record and why it is needed. Disconnecting a Meta account stops that connection but may not automatically delete unrelated account, workspace, campaign, invoice, outreach, security, or legally required records. We retain information only for as long as reasonably necessary to provide the service, meet contractual or legal obligations, resolve disputes, and protect the service.</p><p>You may disconnect an Instagram or Facebook connection through the applicable portal. For account or personal-data deletion requests, contact us using the details below. We may need to verify your identity and may retain limited records where legally permitted or required.</p></Section>
   <Section title="7. Your choices and rights"><p>Depending on your location, you may have rights to access, correct, delete, restrict, or export personal information, or object to certain processing. Workspace administrators can manage member access, but requests involving an organization-controlled workspace may also need to be directed to that organization. You may revoke a deliverable insight share through the Creator portal where that control is available.</p></Section>
   <Section title="8. Security"><p>We use administrative, technical, and organizational safeguards designed to protect information, including persona separation, workspace permissions, session controls, and backend-managed Meta credentials. No service can guarantee absolute security. Protect your password, use a unique password, and notify us if you suspect unauthorized access.</p></Section>
   <Section title="9. International processing"><p>CreatorLinksAI and its providers may process information in countries other than where you live. Where required, we use appropriate safeguards for international transfers.</p></Section>
   <Section title="10. Children"><p>CreatorLinksAI is intended for users who are at least 18 years old or the age of legal majority in their jurisdiction. We do not knowingly collect personal information from children.</p></Section>
   <Section title="11. Changes to this policy"><p>We may update this policy as the service or applicable requirements change. We will publish the revised policy with a new effective date and provide additional notice when required.</p></Section>
   <Section title="12. Contact"><p>Questions or privacy requests may be sent to <a className="font-black underline" href="mailto:creatorlinksai@gmail.com">creatorlinksai@gmail.com</a>.</p></Section>
  </div>
 </article></main>;
}
