// Daily cleanup (called by pg_cron). For every class whose purge date has
// passed: delete student files, then student accounts (cascades remove
// their submissions, messages and devices). Class content made by the
// teacher and certificate records are kept.
//
// Safe to call at any time: it only ever touches classes already past
// purge_after (class start + 74 days), so an extra call changes nothing early.
import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'class-files';

Deno.serve(async () => {
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const today = new Date().toISOString().slice(0, 10);
  const { data: classes, error } = await admin
    .from('classes')
    .select('id')
    .lt('purge_after', today)
    .is('purged_at', null)
    .limit(20);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const report: { classId: string; students: number; files: number }[] = [];

  const failed: { classId: string; error: string }[] = [];

  for (const cls of classes ?? []) {
    try {
      // 1. Student files (recordings, uploads)
      let fileCount = 0;
      const { data: folders, error: listError } = await admin.storage.from(BUCKET).list(cls.id, { limit: 1000 });
      if (listError) throw listError;
      for (const folder of folders ?? []) {
        const prefix = `${cls.id}/${folder.name}`;
        const { data: files, error } = await admin.storage.from(BUCKET).list(prefix, { limit: 1000 });
        if (error) throw error;
        if (files?.length) {
          const { error: removeError } = await admin.storage.from(BUCKET).remove(files.map((f) => `${prefix}/${f.name}`));
          if (removeError) throw removeError;
          fileCount += files.length;
        }
      }

      // 2. Student accounts + mark the class purged, in one transaction.
      //    If anything above failed, the class stays unpurged and is retried tomorrow.
      const { data: students, error } = await admin.rpc('purge_class_students', { p_class_id: cls.id });
      if (error) throw error;
      report.push({ classId: cls.id, students: students ?? 0, files: fileCount });
    } catch (e) {
      failed.push({ classId: cls.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return new Response(JSON.stringify({ purged: report, failed }), {
    status: failed.length ? 500 : 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
