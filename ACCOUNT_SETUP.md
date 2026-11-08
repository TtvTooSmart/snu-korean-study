# Enable optional accounts

Accounts are enabled for the configured Supabase project. For a fresh installation, complete the setup below before enabling accounts. Sign-in is required before study routes become available; disabling accounts does not enable guest access. No fake sign-in or dummy account is shown.

1. Create a Supabase project that you own (or use an existing project dedicated to this app).
2. Run `supabase/schema.sql` in its SQL editor. It creates the private progress table and the revision-checked write function. Anonymous clients have no table access. Signed-in users can read only their own row; the write function takes the user identity from the authenticated request, never from a browser parameter, and runs with the caller’s RLS-protected permissions.
3. In Authentication → URL Configuration, set the Site URL to `https://koreanstudyshivamj.dpdns.org/`. Allow this exact URL as a redirect. Add localhost or a specific preview URL only when needed for testing.
4. Enable email sign-in. Configure an email provider/SMTP for delivery to real students; verify the provider's current sending restrictions before launch. The default email template sends a sign-in link, so no password is stored by this app.
5. Copy the project's URL and **publishable** key into `js/account-config.js`, then set `enabled: true` after the database and redirect setup is complete. This key is public browser configuration. Never use the secret or service-role key. Push to the same GitHub repository; the existing Vercel project deploys it.
6. Test two email accounts and two devices before announcing accounts. Verify sign-in, sign-out, email links, cloud saves, reconnect after offline study, conflict resolution, progress reset, and that user A cannot read user B's row. The Node tests verify sync logic; they cannot replace live authentication and database-policy checks.

Accounts sync word/grammar stats, mastery streaks and flags. Settings, custom book imports and paused sessions stay on each device. Use Export for a complete portable backup. Legacy browser storage is retained without exposing a guest study or copy workflow. Each account gets its own browser cache. Signed-out users cannot start or resume quizzes.

The official Supabase browser SDK is loaded only when accounts are configured. It manages email authentication, session persistence and token renewal. The SDK is the sole optional external runtime dependency. There is still no framework, build step or app server.

Each answer is saved locally immediately. While the app is open, changed progress syncs every 30 seconds; unchanged stats do not trigger a request. Each upload is read back from the server before being marked synced. Pending answers and the last verified revision survive closing the tab in account-specific localStorage and reconcile at the next sign-in. Failed batches retry on the next 30-second tick; Sync now and signing out can also flush pending progress. Background tabs may have their timers delayed by the browser. Revision checks prevent one device silently overwriting another. If both devices studied offline, Account lets the learner select which snapshot to keep; it does **not** add attempt totals, which could double-count shared history. Before resolving, both copies are retained in the browser's `cloudRecovery` field and included in full exports. An interrupted save is safely recognized on retry.

Current status: the private progress database and production redirect are configured. Gmail custom SMTP is enabled and its password is stored only in Supabase. The earlier team-member-only email notice is removed (`emailLimited: false`). Gmail SMTP authentication has been corrected. The owner confirmed email delivery, and both the confirmed email and successful sign-in were verified in Supabase and the app. Real cross-device progress sync remains unverified. Production includes sign-in, admin import access and verified 30-second progress sync. The student dashboard and Autumn animation are staged separately on development.

Development previews currently share the configured Supabase project. Before testing email links on a Vercel preview, add its exact URL to Supabase's redirect allowlist; do not assume the preview is an isolated database. The current allowlist contains only the production domain.

References:
- https://supabase.com/docs/reference/javascript/installing
- https://supabase.com/docs/reference/javascript/auth-signinwithotp
- https://supabase.com/docs/guides/database/postgres/row-level-security

Database setup completed: table, owner-only SELECT/INSERT/UPDATE policies and revision-checked RPC. Live transactional checks passed for two-account isolation, stale-write rejection and anonymous access denial, with all test fixtures rolled back. Security advisors returned no findings. Browser SDK pinned to 2.119.0. Separate Sign in and Sign up routes use email links; Sign in does not create a missing account. Redirect configuration is verified. Email delivery and sign-in have now been verified with the owner’s real account.

Troubleshooting: `otp_disabled` / “Signups not allowed for otp” on Sign in can mean no account exists because this route intentionally uses `shouldCreateUser: false`. Use Sign up for the first successful registration. Do not turn off email confirmation to work around SMTP errors. For Gmail, check host `smtp.gmail.com`, port `465`, full Gmail username, and a valid Google App Password from that same account; enter credentials directly in Supabase, never in code. After saving, retry Sign up and verify both email delivery and the confirmation link.


Admin reporting: install `supabase/admin-dashboard.sql` after the progress schema. The verified owner can read confirmed students' synced statistics through a guarded private function and a read-only public RPC; student RLS policies remain owner-only. The shared database migration is applied. Live rollback tests verified admin access, denied student/guest access, spoofed-metadata rejection, paging and unchanged write restrictions. No fixture users were retained. Student records are not cached locally by the dashboard.
