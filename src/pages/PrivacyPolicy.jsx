import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <section>
    <h2 className="mb-3 text-2xl font-black">{title}</h2>
    <div className="space-y-4 leading-7 text-zinc-700">{children}</div>
  </section>
);

const List = ({ children }) => (
  <ul className="list-disc space-y-2 pl-6">{children}</ul>
);

export default function PrivacyPolicy() {
  return (
    <main className="brutal-page min-h-screen px-5 py-12 text-zinc-900 md:py-16">
      <article className="brutal-card mx-auto max-w-4xl p-6 md:p-10">
        <Link to="/login" className="text-sm font-black underline">
          ← Back to CreatorLinksAI
        </Link>
        <p className="brutal-overline mt-8">Legal · Creator MVP-1</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          <strong>Effective date:</strong> July 26, 2026
        </p>

        <div className="mt-10 space-y-10">
          <Section title="1. Scope">
            <p>
              This Privacy Policy explains how CreatorLinksAI collects, uses,
              stores, and shares information when creators use our website,
              Creator portal, and connected services. Our MVP-1 release is
              limited to creator-facing functionality. Brand and Agency
              functionality marked “Coming Soon” is not part of the currently
              available service.
            </p>
          </Section>

          <Section title="2. Information we collect">
            <List>
              <li>
                <strong>Account and verification information:</strong> your
                email address, user and workspace identifiers, creator persona,
                email-verification status, acceptance of our legal terms,
                authentication sessions, and security events. Passwords are
                stored by our backend in protected, non-plaintext form.
              </li>
              <li>
                <strong>Connected Instagram information:</strong> Instagram
                account identifiers, username, profile information, connection
                status, media and caption metadata, insights and engagement
                metrics, and information received through Meta webhooks and
                APIs. We do not ask for or store your Instagram password. Meta
                access tokens are managed by our backend and are not
                intentionally exposed to the browser.
              </li>
              <li>
                <strong>Auto-DM information:</strong> rules, keywords, selected
                media, private-reply and public-reply text, carousel content,
                follow-confirmation settings, delivery status, and related
                Instagram comment or recipient identifiers required to process
                and troubleshoot configured automations. If you configure PDF
                delivery, we also process the uploaded PDF, its filename, size,
                storage identifier, expiring download links, and download-link
                confirmation records.
              </li>
              <li>
                <strong>AI Script Writer information:</strong> briefs, product
                descriptions, audiences, tones, key points, instructions,
                generated scripts, edits, selected variations, and usage
                records. Do not submit confidential information or personal
                information that is not needed to generate a script.
              </li>
              <li>
                <strong>Media Kit and invoice information:</strong> profile,
                audience, portfolio, contact, pricing, brand, billing, tax,
                address, line-item, signature, and payment-instruction
                information you choose to enter. Do not enter passwords, payment
                card numbers, bank-login credentials, or other unnecessary
                secrets.
              </li>
              <li>
                <strong>Usage and security information:</strong> IP address,
                browser and device information, timestamps, request identifiers,
                errors, rate-limit events, and activity needed to operate,
                protect, and troubleshoot CreatorLinksAI.
              </li>
            </List>
          </Section>

          <Section title="3. How we use information">
            <List>
              <li>
                Register and verify accounts, authenticate users, refresh and
                revoke sessions, prevent abuse, and provide customer support.
              </li>
              <li>
                Connect the Instagram account you authorize and display its
                media and insights in the Creator portal.
              </li>
              <li>
                Monitor eligible comments and perform the Auto-DM and optional
                public-reply behavior you configure, subject to Meta’s rules and
                availability.
              </li>
              <li>
                Generate and manage AI-assisted scripts, media kits, and
                invoices.
              </li>
              <li>
                Maintain, secure, measure, debug, and improve CreatorLinksAI and
                comply with applicable legal obligations.
              </li>
            </List>
            <p>
              Where applicable law requires a legal basis, we process
              information to perform our agreement with you, with your consent
              where requested, for legitimate interests such as security and
              service improvement, or to comply with law.
            </p>
          </Section>

          <Section title="4. How information is shared">
            <p>
              We do not sell personal information. We may disclose information:
            </p>
            <List>
              <li>
                To Meta Platforms when required to connect Instagram, retrieve
                authorized data, receive events, and carry out configured
                Instagram actions.
              </li>
              <li>
                To infrastructure, hosting, database, email, monitoring,
                support, document-generation, and AI service providers acting
                for us to operate the applicable feature.
              </li>
              <li>
                When required by law, to protect rights and safety, investigate
                misuse, enforce our Terms, or as part of a corporate
                transaction.
              </li>
            </List>
            <p>
              Media kits and invoices are intended to be exported and shared by
              you. Anyone who receives an exported file may retain or
              redistribute it outside CreatorLinksAI, so review its contents
              before sharing.
            </p>
          </Section>

          <Section title="5. AI-assisted features">
            <p>
              Information submitted to the AI Script Writer may be processed by
              an AI service provider to generate the requested output. AI output
              may be inaccurate and should be reviewed before use. We do not use
              AI output as an automated decision about your eligibility, rights,
              or access to CreatorLinksAI.
            </p>
          </Section>

          <Section title="6. Sessions and browser storage">
            <p>
              CreatorLinksAI uses browser storage and related technologies to
              maintain authentication, restore the correct Creator session,
              remember workspace and connection context, and support security
              and connection flows. The CreatorLinksAI application JWT is sent
              to our backend to authenticate protected requests.
            </p>
            <p>
              Signing out revokes the current CreatorLinksAI application session
              but does not disconnect Instagram. Disconnecting Instagram removes
              the selected integration but does not, by itself, delete your
              CreatorLinksAI account.
            </p>
          </Section>

          <Section title="7. Retention and deletion">
            <p>
              We retain information only for as long as reasonably necessary to
              provide and secure the service, meet contractual or legal
              obligations, resolve disputes, and enforce agreements. Retention
              periods vary based on the record, its purpose, backup cycles, and
              applicable law.
            </p>
            <p>
              <strong>Disconnect Instagram.</strong> Routine disconnection
              deletes the active Instagram connection and encrypted token,
              along with cached account and recent-media analytics tied to that
              connection. It does not delete your CreatorLinksAI account,
              media kits, invoices, scripts, or Auto-DM configuration.
            </p>
            <p>
              <strong>Full Instagram data deletion.</strong> Creators may use
              “Delete my Instagram data” in Profile and Privacy settings. This
              permanently deletes the Instagram connection and token, cached
              and historical Instagram analytics, Auto-DM rules and delivery
              records, follower-gate records, uploaded Auto-DM PDF assets and
              associated links. It also removes Instagram-derived
              profile-picture and creator-catalog ownership links. The
              operation cannot be undone.
            </p>
            <p>
              You may also initiate full deletion through Meta by removing
              CreatorLinksAI in Meta’s Apps and Websites settings and selecting
              “Send Request.” After receiving and verifying Meta’s signed
              request, we provide a confirmation code and status URL. A full
              Instagram data deletion does not itself delete your CreatorLinksAI
              login account or independently supplied media-kit, invoice,
              billing, tax, or AI-script records.
            </p>
            <p>
              For deletion of your entire CreatorLinksAI account or other
              personal information, contact us below. We may verify your
              identity and retain limited records where legally permitted or
              required, including security, fraud-prevention, financial, or
              compliance records.
            </p>
          </Section>

          <Section title="8. Your choices and rights">
            <p>
              You may disconnect Instagram, request full deletion of your
              Instagram-derived data, create or delete supported Auto-DM rules
              and creator records through available controls. Depending on your
              location, you may also have rights to access, correct, delete,
              restrict, or export personal information, or object to certain
              processing.
            </p>
          </Section>

          <Section title="9. Security">
            <p>
              We use administrative, technical, and organizational safeguards
              designed to protect information, including email verification,
              password requirements, rate limiting, session revocation, Creator
              route protection, and backend-managed Meta credentials. No system
              is completely secure. Use a unique password and notify us if you
              suspect unauthorized access.
            </p>
          </Section>

          <Section title="10. International processing">
            <p>
              CreatorLinksAI and its service providers may process information
              in countries other than where you live. Where required, we use
              appropriate safeguards for international transfers.
            </p>
          </Section>

          <Section title="11. Children">
            <p>
              CreatorLinksAI is intended for users who are at least 18 years old
              or the age of legal majority in their jurisdiction. We do not
              knowingly collect personal information from children.
            </p>
          </Section>

          <Section title="12. Changes to this policy">
            <p>
              We may update this policy as our service or applicable
              requirements change. We will publish the revised policy with a new
              effective date and provide additional notice or request renewed
              acknowledgment when required.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              Questions or privacy requests may be sent to{" "}
              <a
                className="font-black underline"
                href="mailto:support@creatorlinksai.com"
              >
                support@creatorlinksai.com
              </a>
              .
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}
