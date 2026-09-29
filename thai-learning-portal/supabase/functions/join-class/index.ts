// Student self-signup with a class join code.
// Public endpoint (no JWT): validates the code, then creates a confirmed
// account. The profile is left at role='pending' with class_id set to the
// requested class (a join request, not membership) — a teacher approves
// or rejects it from the classroom's Students tab before the student can
// log in. This is what keeps a leaked join code from granting instant
// access to strangers.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body: { joinCode?: string; fullName?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }

  const joinCode = String(body.joinCode ?? '').trim().toUpperCase();
  const fullName = String(body.fullName ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!/^[A-Z0-9]{6}$/.test(joinCode)) return json({ error: 'invalid_code' }, 400);
  if (!fullName || fullName.length > 100) return json({ error: 'invalid_name' }, 400);
  if (!EMAIL.test(email) || email.length > 200) return json({ error: 'invalid_email' }, 400);
  if (password.length < 8 || password.length > 72) return json({ error: 'weak_password' }, 400);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { data: cls, error: clsError } = await admin
    .from('classes')
    .select('id, published, end_date, purged_at')
    .eq('join_code', joinCode)
    .maybeSingle();
  if (clsError) return json({ error: 'server_error' }, 500);

  const today = new Date().toISOString().slice(0, 10);
  if (!cls || !cls.published || cls.purged_at) return json({ error: 'invalid_code' }, 404);
  if (cls.end_date < today) return json({ error: 'class_ended' }, 410);

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) {
    const taken = /already|registered|exists/i.test(error.message);
    return json({ error: taken ? 'email_taken' : 'server_error' }, taken ? 409 : 500);
  }

  // Record which class they're asking to join. handle_new_user() already
  // inserted their profile at role='pending' with class_id null; this just
  // attaches the request for the teacher to see and approve.
  const { error: reqError } = await admin.from('profiles').update({ class_id: cls.id }).eq('id', created.user.id);
  if (reqError) return json({ error: 'server_error' }, 500);

  return json({ ok: true });
});
