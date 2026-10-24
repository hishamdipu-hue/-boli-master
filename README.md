# BOLI — Vessel Lineage

A React + Vite starter for rebuilding BOLI outside the Base44 builder, using the existing Supabase project.

## Local setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the Supabase project's public URL and publishable/anon key. Never use a service-role key in browser code.
5. Run `npm run dev`; verify with `npm run build`.

## Vercel
Import this repository as a Vite project and configure the same two environment variables in Project Settings → Environment Variables.

## Important
This is a clean starter, not a copy of the original Base44 source. It includes a resilient lineage screen querying `public.boli_vessel_links`. Confirm the project's Row Level Security policies permit the signed-in user to read the relevant link records. Parent-link creation/acceptance workflows and the original full BOLI feature set still need to be ported and tested.
