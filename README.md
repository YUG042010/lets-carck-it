# LET'S CRACK IT — setup

1. **Supabase** (supabase.com, free): New project → SQL Editor → paste `schema.sql` → Run.
2. Authentication → Sign In / Providers → Email: turn **off** "Confirm email". Then turn **off** "Allow new users to sign up" (so only you can create accounts).
3. Authentication → Users → **Add user**: email `yug@lci.app` + a password, tick Auto Confirm. (Username = the part before `@lci.app`.) Then in SQL Editor run:
   `update profiles set role='leader' where name='Yug';`
4. Add classmates the same way (`riya@lci.app`, etc.). They log in with just `riya` + password.
5. Project Settings → API: copy the Project URL and **anon public** key into `config.js`. Never use or share the service_role key.
6. Push this folder to a GitHub repo. On **Render**: New → Static Site → pick the repo → Build command: empty → Publish directory: `.` → Create.
7. Every `git push` redeploys automatically.

Change roles: log in as Leader → Profile → Members.
Edit subjects/chapters: top of `app.js`.
