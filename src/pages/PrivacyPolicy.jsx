export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg-deep text-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl border border-panel-border bg-panel p-10 shadow-2xl">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>

          <p className="mt-3 text-text-secondary">Last Updated: July 2026</p>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Introduction</h2>

              <p className="leading-8 text-text-secondary">
                CreatorLinksAI helps creators manage Instagram analytics,
                insights, and engagement through Meta's official APIs. By
                connecting your Instagram Business or Creator account, you
                authorize CreatorLinksAI to access specific information required
                to provide these services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                Information We Collect
              </h2>

              <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-8">
                <li>Instagram Account ID</li>
                <li>Instagram Username</li>
                <li>Facebook Page ID and Page Name</li>
                <li>Encrypted access tokens</li>
                <li>Instagram media IDs</li>
                <li>Analytics and Insights available through Meta APIs</li>
                <li>Auto-DM rules you create</li>
                <li>
                  Comment webhook events used to trigger automated replies
                </li>
              </ul>

              <p className="mt-4 text-text-secondary">
                We never collect or store your Instagram password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                How We Use Your Information
              </h2>

              <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-8">
                <li>Authenticate your Instagram account</li>
                <li>Display analytics and insights</li>
                <li>Operate Auto-DM workflows</li>
                <li>Maintain account connectivity</li>
                <li>Improve reliability and security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data Security</h2>

              <p className="leading-8 text-text-secondary">
                Access tokens are encrypted before being stored. We use
                industry-standard security practices to protect your data from
                unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data Sharing</h2>

              <p className="leading-8 text-text-secondary">
                CreatorLinksAI does not sell your personal information. Data is
                shared only with Meta Platforms when required to provide
                functionality requested by you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data Retention</h2>

              <p className="leading-8 text-text-secondary">
                Your information is retained only while your Instagram account
                remains connected. Disconnecting your account or requesting
                deletion removes your stored account information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data Deletion</h2>

              <p className="leading-8 text-text-secondary">
                Users may disconnect their Instagram account at any time. We
                also support Meta's official Data Deletion Callback mechanism
                for permanent removal of stored account information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>

              <p className="leading-8 text-text-secondary">
                For any privacy-related questions, please contact:
              </p>

              <p className="mt-3 font-medium text-indigo-400">
                creatorlinksai@gmail.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Policy Updates</h2>

              <p className="leading-8 text-text-secondary">
                We may update this Privacy Policy periodically. Any changes will
                be published on this page with a revised effective date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
