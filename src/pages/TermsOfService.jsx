import React from "react";
export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-bg-deep text-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl border border-panel-border bg-panel p-10 shadow-2xl">
          <h1 className="text-4xl font-bold">Terms of Service</h1>

          <p className="mt-3 text-text-secondary">Last Updated: July 2026</p>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold mb-3">
                Acceptance of Terms
              </h2>

              <p className="leading-8 text-text-secondary">
                By using CreatorLinksAI, you agree to these Terms of Service. If
                you do not agree, please discontinue use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Services</h2>

              <p className="leading-8 text-text-secondary">
                CreatorLinksAI provides Instagram analytics, engagement
                automation, Auto-DM workflows, and creator management features
                using Meta's official APIs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                User Responsibilities
              </h2>

              <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-8">
                <li>Provide accurate account information.</li>
                <li>
                  Use the platform in compliance with Meta Platform Policies.
                </li>
                <li>Do not misuse or abuse automation features.</li>
                <li>Comply with all applicable laws and regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                Third-Party Services
              </h2>

              <p className="leading-8 text-text-secondary">
                CreatorLinksAI integrates with Meta Platforms including
                Instagram and Facebook. Your use of those services is governed
                by Meta's own Terms and Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Availability</h2>

              <p className="leading-8 text-text-secondary">
                We strive to maintain reliable service but do not guarantee
                uninterrupted availability or error-free operation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                Limitation of Liability
              </h2>

              <p className="leading-8 text-text-secondary">
                CreatorLinksAI shall not be liable for indirect, incidental, or
                consequential damages resulting from the use or inability to use
                the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                Account Termination
              </h2>

              <p className="leading-8 text-text-secondary">
                Users may disconnect their Instagram account at any time.
                CreatorLinksAI reserves the right to suspend or terminate access
                in cases of abuse or violations of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                Changes to These Terms
              </h2>

              <p className="leading-8 text-text-secondary">
                We may revise these Terms from time to time. Continued use of
                CreatorLinksAI constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact</h2>

              <p className="leading-8 text-text-secondary">
                Questions regarding these Terms can be sent to:
              </p>

              <p className="mt-3 font-medium text-indigo-400">
                creatorlinksai@gmail.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
