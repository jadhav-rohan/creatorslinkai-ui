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

export default function TermsOfService() {
  return (
    <main className="brutal-page min-h-screen px-5 py-12 text-zinc-900 md:py-16">
      <article className="brutal-card mx-auto max-w-4xl p-6 md:p-10">
        <Link to="/login" className="text-sm font-black underline">
          ← Back to CreatorLinksAI
        </Link>
        <p className="brutal-overline mt-8">Legal · Creator MVP-1</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          <strong>Effective date:</strong> July 26, 2026
        </p>

        <div className="mt-10 space-y-10">
          <Section title="1. Acceptance">
            <p>
              By creating an account, selecting the acceptance checkbox, or
              using CreatorLinksAI, you agree to these Terms and acknowledge our
              Privacy Policy. If you do not agree, do not create an account or
              use the service.
            </p>
          </Section>

          <Section title="2. MVP-1 service scope">
            <p>
              CreatorLinksAI MVP-1 provides a Creator portal. Available features
              may include creator registration and email verification, Instagram
              connection management, insights, Auto-DM, AI-assisted script
              writing, media kits, and invoices. Brand and Agency functionality
              marked “Coming Soon” is unavailable in MVP-1 and is not promised
              by any particular date.
            </p>
            <p>
              Features may be changed, limited, suspended, or discontinued as
              the service develops. Beta or preview functionality may be less
              reliable than generally available functionality.
            </p>
          </Section>

          <Section title="3. Eligibility and account security">
            <p>
              You must be at least 18 years old or the age of legal majority in
              your jurisdiction. You must provide accurate information, verify
              your email, keep your credentials confidential, and promptly
              notify us of suspected unauthorized access. You are responsible
              for activity performed through your account unless applicable law
              provides otherwise.
            </p>
            <p>
              You may not share authentication tokens, bypass verification or
              Creator-only route restrictions, impersonate another person, or
              attempt to access an account, workspace, Instagram connection, or
              information you are not authorized to use.
            </p>
          </Section>

          <Section title="4. Instagram and Meta services">
            <p>
              Instagram functionality depends on Meta Platforms and its APIs.
              You must have authority to connect and automate the Instagram
              account you select and must comply with applicable Meta terms,
              policies, permissions, messaging rules, advertising rules, and
              platform limitations.
            </p>
            <p>
              CreatorLinksAI does not control Meta’s availability, app review,
              permissions, delivery decisions, interface rendering, rate limits,
              or API changes. Connecting or disconnecting Instagram is separate
              from signing in to or signing out of CreatorLinksAI.
            </p>
          </Section>

          <Section title="5. Auto-DM and automated replies">
            <p>
              You are solely responsible for the rules, keywords, media,
              messages, links, carousel elements, public replies, and
              follow-confirmation behavior you configure. This includes PDFs
              and other linked content you upload or distribute. You represent
              that you have the right to upload and share that content and that
              it is lawful, safe, and does not infringe third-party rights. You must use
              automation only for lawful purposes and provide any notices,
              disclosures, consent, opt-out methods, and advertising disclosures
              required by law or platform policy.
            </p>
            <p>
              Automation depends on eligible Instagram events and Meta delivery.
              We do not guarantee that every comment will be detected, every
              reply will be sent, a commenter follows your account, or content
              will render exactly like the CreatorLinksAI preview. You must
              review rules and delivery activity and stop or delete
              inappropriate automation.
            </p>
          </Section>

          <Section title="6. AI Script Writer">
            <p>
              AI-generated scripts may be incomplete, inaccurate, similar to
              other content, or unsuitable for your intended use. You must
              review and edit output before publishing and verify product
              claims, endorsements, disclosures, intellectual-property rights,
              brand instructions, and legal compliance. AI output is not legal,
              financial, medical, or professional advice.
            </p>
            <p>
              You must not submit confidential information, unlawful material,
              or personal information you lack authority to process. You remain
              responsible for the final content you publish or share.
            </p>
          </Section>

          <Section title="7. Media kits, invoices, and exports">
            <p>
              Media kits and invoices are creator productivity tools.
              CreatorLinksAI is not an accounting, tax, legal, payment,
              e-signature, or collection service. Generated calculations,
              documents, styling, signatures, and exports must be reviewed by
              you before use.
            </p>
            <p>
              You are responsible for accurate identity, tax, billing, currency,
              pricing, payment, and recipient information; for keeping required
              business records; and for obtaining professional advice where
              appropriate. Do not enter payment-card data, bank-login
              credentials, passwords, or unnecessary sensitive information.
            </p>
          </Section>

          <Section title="8. Your content and license">
            <p>
              You retain ownership of content and information you submit. You
              grant CreatorLinksAI a non-exclusive, worldwide, limited license
              to host, process, reproduce, transmit, and display that content
              only as reasonably necessary to provide, secure, support, and
              improve the service.
            </p>
            <p>
              You represent that you have the rights and permissions required to
              submit and use your content, including images, music, captions,
              trademarks, links, contact information, and information about
              other people.
            </p>
          </Section>

          <Section title="9. Acceptable use">
            <p>You may not:</p>
            <List>
              <li>
                Use CreatorLinksAI unlawfully, fraudulently, deceptively, or to
                harass, exploit, threaten, or discriminate against another
                person.
              </li>
              <li>
                Send spam, deceptive promotions, prohibited content, or
                automation that violates consent, messaging, privacy,
                advertising, or consumer-protection requirements.
              </li>
              <li>
                Upload malware; infringe privacy, publicity, intellectual
                property, or other rights; or submit information you are not
                permitted to use.
              </li>
              <li>
                Scrape, probe, disrupt, overload, reverse engineer, or bypass
                security, rate limits, authentication, permissions, or access
                controls.
              </li>
              <li>
                Use the service to make high-impact decisions about another
                person or for unauthorized surveillance or data resale.
              </li>
            </List>
          </Section>

          <Section title="10. Intellectual property">
            <p>
              CreatorLinksAI and its software, design, branding, and service
              content are owned by us or our licensors. Except for rights
              expressly granted in these Terms, no license or ownership right is
              transferred to you. Feedback may be used to improve the service
              without obligation to you.
            </p>
          </Section>

          <Section title="11. Suspension, termination, and deletion">
            <p>
              You may stop using the service, sign out, and disconnect Instagram
              at any time. Routine disconnection removes the active connection
              and cached analytics but does not delete your CreatorLinksAI
              account, Auto-DM rules, or independently supplied records.
            </p>
            <p>
              Creators may separately use “Delete my Instagram data” in Profile
              and Privacy settings. That irreversible action deletes the
              Instagram connection, Instagram-derived analytics, Auto-DM data
              and uploaded PDF assets. Users may also trigger this process
              through Meta’s Apps and Websites deletion-request mechanism. Full
              Instagram data deletion does not itself close the CreatorLinksAI
              login account or delete independently supplied invoices, media
              kits, billing records, or AI scripts.
            </p>
            <p>
              To request deletion of the entire CreatorLinksAI account or other
              personal information, use the contact details below. Information
              already received or retained independently by another person or
              organization cannot necessarily be retrieved by CreatorLinksAI.
            </p>
            <p>
              We may restrict or terminate access when reasonably necessary to
              address violations, legal obligations, security threats, abuse,
              platform requirements, or risks to users, third parties, or the
              service. Provisions that by their nature should survive
              termination will continue to apply.
            </p>
          </Section>

          <Section title="12. Availability and disclaimers">
            <p>
              CreatorLinksAI is provided on an “as is” and “as available” basis
              to the extent permitted by law. We do not guarantee uninterrupted
              operation, delivery of automated messages, availability or
              accuracy of Instagram data, accuracy of AI output, acceptance of
              invoices, business results, audience growth, or that every error
              will be corrected.
            </p>
          </Section>

          <Section title="13. Limitation of liability">
            <p>
              To the fullest extent permitted by applicable law, CreatorLinksAI
              will not be liable for indirect, incidental, special,
              consequential, exemplary, or punitive damages, or for lost
              profits, revenue, data, goodwill, content, audience, or business
              opportunities arising from use of or inability to use the service.
              Nothing in these Terms excludes liability that cannot legally be
              excluded.
            </p>
          </Section>

          <Section title="14. Changes">
            <p>
              We may update these Terms as the service or applicable
              requirements change. Revised Terms will be published with a new
              effective date. When required, we will provide additional notice
              or request renewed acceptance. Continued use after updated Terms
              become effective constitutes acceptance where permitted by law.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              Questions about these Terms may be sent to{" "}
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
