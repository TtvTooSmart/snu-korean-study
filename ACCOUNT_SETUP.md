# Enable optional accounts

The UI and sync modules are included, but accounts remain disabled until a real Supabase project is configured. Guest study continues to work offline without external dependencies. No fake sign-in or dummy account is shown.

1. Create a Supabase project that you own (or use an existing project dedicated to this app).
2. Run `supabase/schema.sql` in its SQL editor. It creates the private progress table and the revision-checked write function. Anonymous clients have no table access. Signed-in users can read only their own row; the write function takes the user identity from the authenticated request, never from a browser parameter, and runs with the caller’s RLS-protected permissions.
3. In Authentication → URL Configuration, set the Site URL to `https://koreanstudyshivamj.dpdns.org/`. Allow this exact URL as a redirect. Add localhost or a specific preview URL only when needed for testing.
4. Enable email sign-in. Configure an email provider/SMTP for delivery to real students; verify the provider's current sending restrictions before launch. The default email template sends a sign-in link, so no password is stored by this app.
5. Copy the project's URL and **publishable** key into `js/account-config.js`, then set `enabled: true` after the database and redirect setup is complete. This key is public browser configuration. Never use the secret or service-role key. Push to the same GitHub repository; the existing Vercel project deploys it.
6. Test two email accounts and two devices before announcing accounts. Verify sign-in, sign-out, email links, cloud saves, guest import, reconnect after offline study, conflict resolution, progress reset, and that user A cannot read user B's row. The Node tests verify sync logic; they cannot replace live authentication and database-policy checks.

Accounts sync word/grammar stats, mastery streaks and flags. Settings, custom book imports and paused sessions stay on each device. Use Export for a complete portable backup. Guests retain their existing `snu-study` storage. Each account gets its own browser cache. Guest progress is copied only when explicitly requested in Account.

The official Supabase browser SDK is loaded only when accounts are configured. It manages email authentication, session persistence and token renewal. The SDK is the sole optional external runtime dependency. There is still no framework, build step or app server.

Sync runs after progress changes and on focus/reconnect. Revision checks prevent one device silently overwriting another. If both devices studied offline, Account lets the learner select which snapshot to keep; it does **not** add attempt totals, which could double-count shared history. Before resolving, both copies are retained in the browser's `cloudRecovery` field and included in full exports. An interrupted save is safely recognized on retry.

Current status: the private progress database and production redirect are configured. Gmail custom SMTP is enabled and its password is stored only in Supabase. The development branch removes the earlier team-member-only email notice (`emailLimited: false`). Live signup testing is currently blocked: Gmail rejected SMTP authentication with `535 5.7.8 Username and Password not accepted`. The owner must replace the saved SMTP password with a valid Google App Password for the configured SMTP username. Clicking a sign-in link and cloud sync with a real account remain unverified. Production code is intentionally unchanged until this development update is approved for release.

Development previews currently share the configured Supabase project. Before testing email links on a Vercel preview, add its exact URL to Supabase's redirect allowlist; do not assume the preview is an isolated database. The current allowlist contains only the production domain.

References:
- https://supabase.com/docs/reference/javascript/installing
- https://supabase.com/docs/reference/javascript/auth-signinwithotp
- https://supabase.com/docs/guides/database/postgres/row-level-security

Database setup completed: table, owner-only SELECT/INSERT/UPDATE policies and revision-checked RPC. Live transactional checks passed for two-account isolation, stale-write rejection and anonymous access denial, with all test fixtures rolled back. Security advisors returned no findings. Browser SDK pinned to 2.119.0. Separate Sign in and Sign up routes use email links; Sign in does not create a missing account. Redirect configuration is verified. Actual email delivery and complete sign-in still need testing with a real mailbox.

Troubleshooting: `otp_disabled` / “Signups not allowed for otp” on Sign in can mean no account exists because this route intentionally uses `shouldCreateUser: false`. Use Sign up for the first successful registration. Do not turn off email confirmation to work around SMTP errors. For Gmail, check host `smtp.gmail.com`, port `465`, full Gmail username, and a valid Google App Password from that same account; enter credentials directly in Supabase, never in code. After saving, retry Sign up and verify both email delivery and the confirmation link.
