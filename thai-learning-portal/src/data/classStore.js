import { useEffect, useSyncExternalStore } from 'react';
import { invokeFunction, supabase } from '../lib/supabase';

// Teacher-side class data, loaded from Supabase and cached in memory.
// Components use the hooks and actions below; each action writes to the
// database and then refreshes the cache. Row Level Security decides what
// the signed-in teacher may read or change.

let state = { classes: [], loaded: false, loading: false, error: null };
const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function clearClassStore() {
  setState({ classes: [], loaded: false, loading: false, error: null });
}

/* ---------- mapping DB rows -> UI shape ---------- */

const byPosition = (a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at);

function mapClass(row, devicesByUser) {
  const profiles = row.students ?? [];
  const students = profiles
    .filter((p) => p.role === 'student')
    .map((p) => ({
      id: p.id,
      name: p.full_name || p.email,
      email: p.email,
      lastActive: p.last_active || '',
      devices: devicesByUser[p.id] ?? [],
    }));
  // Joined with the class code but not yet let in by the teacher.
  const pendingRequests = profiles
    .filter((p) => p.role === 'pending')
    .map((p) => ({ id: p.id, name: p.full_name || p.email, email: p.email }));

  const assignments = (row.assignments ?? [])
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      instructions: a.instructions,
      dueDate: a.due_date || '',
      points: a.points,
      moduleId: a.module_id || '',
      published: a.published,
      submissions: (a.submissions ?? []).map((s) => ({
        id: s.id,
        studentId: s.student_id,
        submittedAt: s.submitted_at,
        status: s.status,
        score: s.score,
        content: s.content,
        filePath: s.file_path,
      })),
    }));

  // Progress = share of published assignments the student has handed in.
  const published = assignments.filter((a) => a.published);
  students.forEach((st) => {
    const done = published.filter((a) => a.submissions.some((s) => s.studentId === st.id)).length;
    st.progress = published.length ? Math.round((done / published.length) * 100) : 0;
  });

  return {
    id: row.id,
    name: row.name,
    level: row.level,
    description: row.description,
    schedule: row.schedule,
    startDate: row.start_date,
    endDate: row.end_date,
    purgeAfter: row.purge_after,
    purgedAt: row.purged_at,
    letter: row.letter,
    tone: row.tone,
    published: row.published,
    joinCode: row.join_code,
    settings: row.settings,
    teacherId: row.teacher_id,
    students,
    pendingRequests,
    modules: (row.modules ?? []).sort(byPosition).map((m) => ({
      id: m.id,
      title: m.title,
      published: m.published,
      items: (m.module_items ?? []).sort(byPosition).map((i) => ({
        id: i.id,
        type: i.type,
        title: i.title,
        url: i.url,
        content: i.content,
      })),
    })),
    assignments,
    messages: (row.messages ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((m) => ({
        id: m.id,
        threadId: m.thread_student_id || 'all',
        from: m.sender_id === row.teacher_id ? 'teacher' : m.sender_id,
        text: m.body,
        at: m.created_at,
      })),
    certificate: {
      ...row.certificate,
      issued: (row.certificates ?? [])
        .filter((c) => c.student_id)
        .map((c) => ({ studentId: c.student_id, number: c.number, date: c.issued_on })),
    },
  };
}

const CLASS_QUERY = `
  *,
  students:profiles!profiles_class_id_fkey(id, full_name, email, last_active, role),
  modules(*, module_items(*)),
  assignments(*, submissions(*)),
  messages(*),
  certificates(*)
`;

export async function refreshClasses() {
  setState({ loading: true });
  const [{ data: rows, error }, { data: devices }] = await Promise.all([
    supabase.from('classes').select(CLASS_QUERY).order('created_at'),
    supabase.from('user_devices').select('user_id, device_id, label, last_seen'),
  ]);
  if (error) {
    setState({ loading: false, loaded: true, error: error.message });
    return;
  }
  const devicesByUser = {};
  (devices ?? []).forEach((d) => (devicesByUser[d.user_id] ??= []).push(d));
  setState({ classes: rows.map((r) => mapClass(r, devicesByUser)), loaded: true, loading: false, error: null });
}

export function useClassesState() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  useEffect(() => {
    if (!state.loaded && !state.loading) refreshClasses();
  }, []);
  return snap;
}

export function useClasses() {
  return useClassesState().classes;
}

export function useClass(id) {
  return useClassesState().classes.find((c) => c.id === id);
}

export function dismissError() {
  setState({ error: null });
}

// Run a write, surface its error in the store, then reload.
async function write(fn, { refresh = true } = {}) {
  const result = await fn();
  if (result?.error) {
    setState({ error: result.error.message });
    throw result.error;
  }
  if (refresh) await refreshClasses();
  return result?.data;
}

const findClass = (id) => state.classes.find((c) => c.id === id);

/* ---------- class ---------- */

export async function createClass(data) {
  const { data: user } = await supabase.auth.getUser();
  const row = await write(() =>
    supabase
      .from('classes')
      .insert({
        teacher_id: user.user.id,
        name: data.name,
        level: data.level,
        description: data.description || '',
        schedule: data.schedule || '',
        start_date: data.startDate || undefined,
        letter: data.letter,
        tone: data.tone,
        certificate: {
          enabled: data.certificate ?? true,
          title: `Certificate of Completion — ${data.name}`,
          minProgress: 80,
          requireAllAssignments: true,
          signer: data.signer || '',
          signerTitle: 'Thai Language Teacher',
          style: 'classic',
        },
      })
      .select('id')
      .single()
  );
  return row.id;
}

const CLASS_COLUMNS = { name: 'name', level: 'level', description: 'description', schedule: 'schedule', startDate: 'start_date', letter: 'letter', tone: 'tone', published: 'published', settings: 'settings' };

export async function updateClass(id, patch) {
  const resolved = typeof patch === 'function' ? patch(findClass(id)) : patch;
  const row = {};
  Object.entries(resolved).forEach(([k, v]) => CLASS_COLUMNS[k] && (row[CLASS_COLUMNS[k]] = v));
  // Optimistic: show the change immediately.
  setState({ classes: state.classes.map((c) => (c.id === id ? { ...c, ...resolved } : c)) });
  await write(() => supabase.from('classes').update(row).eq('id', id));
}

export async function deleteClass(id) {
  await invokeFunction('manage-students', { action: 'delete-class', classId: id }).catch((e) => {
    setState({ error: e.message });
    throw e;
  });
  await refreshClasses();
}

export async function regenerateJoinCode(id) {
  await write(() => supabase.rpc('regenerate_join_code', { p_class_id: id }));
}

/* ---------- modules ---------- */

export async function addModule(classId, title) {
  const position = findClass(classId).modules.length;
  await write(() => supabase.from('modules').insert({ class_id: classId, title, position }));
}

export async function updateModule(classId, moduleId, patch) {
  await write(() => supabase.from('modules').update(patch).eq('id', moduleId));
}

async function reorder(table, ids) {
  await write(() =>
    Promise.all(ids.map((id, position) => supabase.from(table).update({ position }).eq('id', id))).then(
      (results) => results.find((r) => r.error) || {}
    )
  );
}

const swap = (list, index, dir) => {
  const to = index + dir;
  if (to < 0 || to >= list.length) return null;
  const ids = list.map((x) => x.id);
  [ids[index], ids[to]] = [ids[to], ids[index]];
  return ids;
};

export async function moveModule(classId, index, dir) {
  const ids = swap(findClass(classId).modules, index, dir);
  if (ids) await reorder('modules', ids);
}

export async function deleteModule(classId, moduleId) {
  await write(() => supabase.from('modules').delete().eq('id', moduleId));
}

export async function addModuleItem(classId, moduleId, item) {
  const module = findClass(classId).modules.find((m) => m.id === moduleId);
  await write(() =>
    supabase.from('module_items').insert({
      module_id: moduleId,
      type: item.type,
      title: item.title,
      url: item.url || '',
      content: item.content || '',
      position: module.items.length,
    })
  );
}

export async function moveModuleItem(classId, moduleId, index, dir) {
  const module = findClass(classId).modules.find((m) => m.id === moduleId);
  const ids = swap(module.items, index, dir);
  if (ids) await reorder('module_items', ids);
}

export async function deleteModuleItem(classId, moduleId, itemId) {
  await write(() => supabase.from('module_items').delete().eq('id', itemId));
}

/* ---------- assignments ---------- */

export async function saveAssignment(classId, a) {
  const row = {
    class_id: classId,
    title: a.title,
    type: a.type,
    instructions: a.instructions || '',
    due_date: a.dueDate || null,
    points: a.points,
    module_id: a.moduleId || null,
    published: a.published,
  };
  await write(() => (a.id ? supabase.from('assignments').update(row).eq('id', a.id) : supabase.from('assignments').insert(row)));
}

export async function deleteAssignment(classId, assignmentId) {
  await write(() => supabase.from('assignments').delete().eq('id', assignmentId));
}

export async function gradeSubmission(classId, assignmentId, studentId, score) {
  await write(() =>
    supabase.from('submissions').update({ score, status: 'graded' }).eq('assignment_id', assignmentId).eq('student_id', studentId)
  );
}

export async function submissionFileUrl(path) {
  const { data } = await supabase.storage.from('class-files').createSignedUrl(path, 60 * 10);
  return data?.signedUrl;
}

/* ---------- students ---------- */

// Returns the temporary password to hand to the student.
export async function addStudent(classId, { name, email }) {
  const data = await invokeFunction('manage-students', { action: 'add', classId, fullName: name, email });
  await refreshClasses();
  return data.tempPassword;
}

export async function removeStudent(classId, studentId) {
  await invokeFunction('manage-students', { action: 'remove', classId, studentId }).catch((e) => {
    setState({ error: e.message });
    throw e;
  });
  await refreshClasses();
}

export async function approveJoinRequest(studentId) {
  await write(() => supabase.rpc('approve_join_request', { p_student_id: studentId }));
}

export async function rejectJoinRequest(classId, studentId) {
  await invokeFunction('manage-students', { action: 'reject', classId, studentId }).catch((e) => {
    setState({ error: e.message });
    throw e;
  });
  await refreshClasses();
}

export async function resetDevices(classId, studentId) {
  await write(() => supabase.from('user_devices').delete().eq('user_id', studentId));
}

/* ---------- messages ---------- */

export async function sendMessage(classId, threadId, text) {
  const { data: user } = await supabase.auth.getUser();
  await write(() =>
    supabase.from('messages').insert({
      class_id: classId,
      thread_student_id: threadId === 'all' ? null : threadId,
      sender_id: user.user.id,
      body: text,
    })
  );
}

/* ---------- certificate ---------- */

const certTimers = {};

// Text fields change on every keystroke: update the screen now, save after a pause.
export function updateCertificate(classId, patch) {
  const cls = findClass(classId);
  const next = { ...cls.certificate, ...patch };
  setState({ classes: state.classes.map((c) => (c.id === classId ? { ...c, certificate: next } : c)) });
  clearTimeout(certTimers[classId]);
  certTimers[classId] = setTimeout(() => {
    // eslint-disable-next-line no-unused-vars
    const { issued, ...settings } = next;
    write(() => supabase.from('classes').update({ certificate: settings }).eq('id', classId), { refresh: false }).catch(() => {});
  }, 500);
}

export async function issueCertificate(classId, studentId) {
  await write(() => supabase.rpc('issue_certificate', { p_class_id: classId, p_student_id: studentId }));
}

export async function revokeCertificate(classId, studentId) {
  await write(() => supabase.rpc('revoke_certificate', { p_class_id: classId, p_student_id: studentId }));
}

/* ---------- derived ---------- */

export function isEligible(cls, student) {
  const cert = cls.certificate;
  if (student.progress < cert.minProgress) return false;
  if (!cert.requireAllAssignments) return true;
  return cls.assignments.filter((a) => a.published).every((a) => a.submissions.some((s) => s.studentId === student.id));
}

export function pendingSubmissions(cls) {
  return cls.assignments.flatMap((a) =>
    a.submissions
      .filter((s) => s.status === 'submitted')
      .map((s) => ({ ...s, assignment: a, student: cls.students.find((st) => st.id === s.studentId) }))
  );
}
