// Teacher-only actions that need admin rights:
//  - add:          create a student account (temporary password) in a class
//  - remove:       delete a student account; cascades remove their
//                  submissions, messages and devices
//  - delete-class: delete a class together with its student accounts and files
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function tempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const authHeader = req.headers.get('Authorization') ?? '';

  // Client acting as the caller: RLS proves they own the class.
  const asCaller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  let body: { action?: string; classId?: string; fullName?: string; email?: string; studentId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }

  const { data: auth } = await asCaller.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
  if (!auth?.user) return json({ error: 'forbidden' }, 403);
  const { data: me } = await asCaller.from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
  const { data: cls } = await asCaller.from('classes').select('id, purged_at').eq('id', body.classId ?? '').maybeSingle();
  if (!cls || me?.role !== 'teacher') return json({ error: 'forbidden' }, 403);

  if (body.action === 'add') {
    const fullName = String(body.fullName ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    if (!fullName || fullName.length > 100) return json({ error: 'invalid_name' }, 400);
    if (!EMAIL.test(email)) return json({ error: 'invalid_email' }, 400);
    if (cls.purged_at) return json({ error: 'class_ended' }, 410);

    const password = tempPassword();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: { class_id: cls.id, role: 'student' },
    });
    if (error) {
      const taken = /already|registered|exists/i.test(error.message);
      return json({ error: taken ? 'email_taken' : 'server_error' }, taken ? 409 : 500);
    }
    return json({ ok: true, studentId: data.user.id, tempPassword: password });
  }

  if (body.action === 'remove') {
    // Only students of this class can be removed.
    const { data: student } = await admin
      .from('profiles')
      .select('id')
      .eq('id', body.studentId ?? '')
      .eq('class_id', cls.id)
      .eq('role', 'student')
      .maybeSingle();
    if (!student) return json({ error: 'not_found' }, 404);

    const { data: files } = await admin.storage.from('class-files').list(`${cls.id}/${student.id}`, { limit: 1000 });
    if (files?.length) {
      await admin.storage.from('class-files').remove(files.map((f) => `${cls.id}/${student.id}/${f.name}`));
    }
    const { error } = await admin.auth.admin.deleteUser(student.id);
    if (error) return json({ error: 'server_error' }, 500);
    return json({ ok: true });
  }

  if (body.action === 'delete-class') {
    const { data: folders } = await admin.storage.from('class-files').list(cls.id, { limit: 1000 });
    for (const folder of folders ?? []) {
      const prefix = `${cls.id}/${folder.name}`;
      const { data: files } = await admin.storage.from('class-files').list(prefix, { limit: 1000 });
      if (files?.length) await admin.storage.from('class-files').remove(files.map((f) => `${prefix}/${f.name}`));
    }
    const { error: purgeError } = await admin.rpc('purge_class_students', { p_class_id: cls.id });
    if (purgeError) return json({ error: 'server_error' }, 500);
    const { error } = await admin.from('classes').delete().eq('id', cls.id);
    if (error) return json({ error: 'server_error' }, 500);
    return json({ ok: true });
  }

  return json({ error: 'invalid_action' }, 400);
});
