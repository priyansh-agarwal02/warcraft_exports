# ⚡ WARCRAFT EXPORTS — QUICK CONTEXT CARD
> Paste this when starting a new feature mid-session or when context feels lost.

## PROJECT PATHS
- Website: `C:\Users\priya\Desktop\AI WORKSPACE\PROJECTS\warcraft_exports\warcraft-exports`
- Docs: `C:\Users\priya\Desktop\AI WORKSPACE\PROJECTS\warcraft_exports`
- Skills/Utils: `C:\Users\priya\Desktop\AI WORKSPACE\.claude`
- All API keys & secrets: `.env.local` (NEVER hardcode, NEVER commit)
- Supabase SQL files: `warcraft-exports/supabase/` (run these in Supabase SQL Editor)

## NON-NEGOTIABLE RULES
1. **Study first, code second** — read the file tree before touching anything
2. **No breaks** — never modify working code outside the task scope
3. **Surgical changes** — minimum files, minimum edits
4. **Match existing patterns** — naming, structure, imports, styling
5. **Full implementation** — no TODOs, no stubs, no silent errors
6. **Type everything** — no `any`, extend existing types
7. **Risk check before submitting** — trace all affected routes/components
8. **Env vars only from .env.local** — never hardcode keys or URLs
9. **All DB changes = .sql file in supabase/** — with RLS, header comment, and rollback note

## BEFORE CODING, CONFIRM:
- [ ] File tree read
- [ ] Config files read (package.json, tsconfig, etc.)
- [ ] Existing similar component identified and referenced
- [ ] Files to create/modify listed explicitly
- [ ] No existing functionality at risk
- [ ] Env vars needed → confirmed they exist in .env.local
- [ ] DB changes needed → .sql file planned for supabase/ folder - I will manually paste it in SQL editor.

## RESPONSE MUST INCLUDE:
1. Files to create / modify / read
2. Risk assessment
3. Full working code
4. Integration steps
5. (If DB change) → SQL file content for supabase/ folder 
6. (If new env var) → exact line to add to .env.local


## BANNED:
Deleting files · Renaming files · Changing existing exports · Restructuring folders ·
Installing packages without flagging · `@ts-ignore` · Leaving TODOs · Skipping error handling ·
Hardcoding API keys · Writing SQL inline in app code · Skipping RLS on user-data tables ·
Committing .env.local

## IF SOMETHING BREAKS: Stop → Identify → Revert → Report → Replan