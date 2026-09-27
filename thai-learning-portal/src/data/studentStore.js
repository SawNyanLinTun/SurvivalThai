import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Everything a signed-in student can see about their one class.
// Row Level Security limits every query to the student's own class and data.

const byPosition = (a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at);

async function loadStudentData(userId) {
  const { data: cls, error } = await supabase
    .from('classes')
    .select('*, modules(*, module_items(*)), assignments(*)')
    .maybeSingle();
  if (error) throw error;
  if (!cls) return { cls: null };

  const [subs, msgs, cert, teacher] = await Promise.all([
    supabase.from('submissions').select('*').eq('student_id', userId),
    supabase.from('messages').select('*').order('created_at'),
    supabase.from('certificates').select('*').eq('student_id', userId).maybeSingle(),
    supabase.from('profiles').select('full_name').eq('id', cls.teacher_id).maybeSingle(),
  ]);

  const submissions = Object.fromEntries((subs.data ?? []).map((s) => [s.assignment_id, s]));
  const assignments = (cls.assignments ?? [])
    .sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'))
    .map((a) => ({ ...a, submission: submissions[a.id] ?? null }));
  const done = assignments.filter((a) => a.submission).length;

  return {
    cls: {
      ...cls,
      modules: (cls.modules ?? []).sort(byPosition).map((m) => ({ ...m, items: (m.module_items ?? []).sort(byPosition) })),
      assignments,
      progress: assignments.length ? Math.round((done / assignments.length) * 100) : 0,
      isOpen: new Date().toISOString().slice(0, 10) <= cls.end_date,
    },
    messages: msgs.data ?? [],
    certificate: cert.data ?? null,
    teacherName: teacher.data?.full_name || '',
  };
}

export function useStudentClass(userId) {
  const [state, setState] = useState({ loading: true, error: null, cls: null, messages: [], certificate: null, teacherName: '' });

  const refresh = useCallback(async () => {
    try {
      const data = await loadStudentData(userId);
      setState({ loading: false, error: null, messages: [], certificate: null, teacherName: '', ...data });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    // New messages and grades show up without reloading the page.
    const timer = setInterval(() => document.visibilityState === 'visible' && refresh(), 30000);
    return () => clearInterval(timer);
  }, [refresh]);

  return { ...state, refresh };
}

const EXTENSIONS = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/wav': 'wav', 'audio/x-m4a': 'm4a', 'image/jpeg': 'jpg', 'image/png': 'png', 'application/pdf': 'pdf' };

export async function submitAssignment({ classId, userId, assignment, content, file }) {
  let filePath = assignment.submission?.file_path ?? null;
  if (file) {
    const ext = EXTENSIONS[file.type] || file.name.split('.').pop() || 'bin';
    filePath = `${classId}/${userId}/${assignment.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('class-files').upload(filePath, file, { contentType: file.type || undefined });
    if (error) throw new Error(/size/i.test(error.message) ? 'file_too_large' : 'upload_failed');
  }

  const now = new Date().toISOString();
  const { error } = assignment.submission
    ? await supabase
        .from('submissions')
        .update({ content, file_path: filePath, submitted_at: now })
        .eq('id', assignment.submission.id)
    : await supabase
        .from('submissions')
        .insert({ assignment_id: assignment.id, student_id: userId, content, file_path: filePath });
  if (error) throw new Error('submit_failed');
}

export async function sendStudentMessage({ classId, userId, text }) {
  const { error } = await supabase
    .from('messages')
    .insert({ class_id: classId, thread_student_id: userId, sender_id: userId, body: text });
  if (error) throw new Error('send_failed');
}
