import { useSyncExternalStore } from 'react';
import { seedClasses } from './seed';
import { joinCode, uid } from '../utils/format';

// Demo persistence in localStorage. Swap these functions for API calls when
// the backend exists — components only use the exported hooks and actions.

const KEY = 'classes';
const listeners = new Set();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (Array.isArray(saved)) return saved;
  } catch {
    // fall through to seed data
  }
  return seedClasses();
}

let classes = load();

function commit(next) {
  classes = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(classes));
  } catch {
    // storage full or unavailable: keep working in memory
  }
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => classes;

export function useClasses() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useClass(id) {
  return useClasses().find((c) => c.id === id);
}

/* ---------- class ---------- */

export function createClass(data) {
  const id = `c-${uid()}`;
  const cls = {
    id,
    name: data.name,
    level: data.level,
    description: data.description || '',
    schedule: data.schedule || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    letter: data.letter || 'ก',
    tone: data.tone || 'primary',
    published: false,
    joinCode: joinCode(),
    settings: { allowMessages: true, allowLate: true, showGrades: true, instructionLanguage: 'my' },
    students: [],
    modules: [],
    assignments: [],
    messages: [],
    certificate: {
      enabled: data.certificate ?? true,
      title: `Certificate of Completion — ${data.name}`,
      minProgress: 80,
      requireAllAssignments: true,
      signer: data.signer || '',
      signerTitle: 'Thai Language Teacher',
      style: 'classic',
      issued: [],
    },
  };
  commit([...classes, cls]);
  return id;
}

export function updateClass(id, patch) {
  commit(classes.map((c) => (c.id === id ? { ...c, ...(typeof patch === 'function' ? patch(c) : patch) } : c)));
}

export function deleteClass(id) {
  commit(classes.filter((c) => c.id !== id));
}

export function regenerateJoinCode(id) {
  updateClass(id, { joinCode: joinCode() });
}

/* ---------- list helpers ---------- */

const replaceIn = (list, itemId, patch) =>
  list.map((x) => (x.id === itemId ? { ...x, ...(typeof patch === 'function' ? patch(x) : patch) } : x));

const move = (list, index, dir) => {
  const to = index + dir;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
};

/* ---------- modules ---------- */

export function addModule(classId, title) {
  updateClass(classId, (c) => ({ modules: [...c.modules, { id: `m-${uid()}`, title, published: false, items: [] }] }));
}

export function updateModule(classId, moduleId, patch) {
  updateClass(classId, (c) => ({ modules: replaceIn(c.modules, moduleId, patch) }));
}

export function moveModule(classId, index, dir) {
  updateClass(classId, (c) => ({ modules: move(c.modules, index, dir) }));
}

export function deleteModule(classId, moduleId) {
  updateClass(classId, (c) => ({
    modules: c.modules.filter((m) => m.id !== moduleId),
    assignments: c.assignments.map((a) => (a.moduleId === moduleId ? { ...a, moduleId: '' } : a)),
  }));
}

export function addModuleItem(classId, moduleId, item) {
  updateModule(classId, moduleId, (m) => ({ items: [...m.items, { id: `i-${uid()}`, ...item }] }));
}

export function moveModuleItem(classId, moduleId, index, dir) {
  updateModule(classId, moduleId, (m) => ({ items: move(m.items, index, dir) }));
}

export function deleteModuleItem(classId, moduleId, itemId) {
  updateModule(classId, moduleId, (m) => ({ items: m.items.filter((i) => i.id !== itemId) }));
}

/* ---------- assignments ---------- */

export function saveAssignment(classId, assignment) {
  updateClass(classId, (c) =>
    assignment.id
      ? { assignments: replaceIn(c.assignments, assignment.id, assignment) }
      : { assignments: [...c.assignments, { ...assignment, id: `a-${uid()}`, submissions: [] }] }
  );
}

export function deleteAssignment(classId, assignmentId) {
  updateClass(classId, (c) => ({ assignments: c.assignments.filter((a) => a.id !== assignmentId) }));
}

export function gradeSubmission(classId, assignmentId, studentId, score) {
  updateClass(classId, (c) => ({
    assignments: replaceIn(c.assignments, assignmentId, (a) => ({
      submissions: a.submissions.map((s) => (s.studentId === studentId ? { ...s, score, status: 'graded' } : s)),
    })),
  }));
}

/* ---------- students ---------- */

export function addStudent(classId, { name, email }) {
  updateClass(classId, (c) => ({
    students: [...c.students, { id: `s-${uid()}`, name, email, progress: 0, lastActive: '' }],
  }));
}

export function removeStudent(classId, studentId) {
  updateClass(classId, (c) => ({
    students: c.students.filter((s) => s.id !== studentId),
    messages: c.messages.filter((m) => m.threadId !== studentId),
    assignments: c.assignments.map((a) => ({ ...a, submissions: a.submissions.filter((s) => s.studentId !== studentId) })),
    certificate: { ...c.certificate, issued: c.certificate.issued.filter((i) => i.studentId !== studentId) },
  }));
}

/* ---------- messages ---------- */

export function sendMessage(classId, threadId, text) {
  updateClass(classId, (c) => ({
    messages: [...c.messages, { id: `msg-${uid()}`, threadId, from: 'teacher', text, at: new Date().toISOString() }],
  }));
}

/* ---------- certificate ---------- */

export function updateCertificate(classId, patch) {
  updateClass(classId, (c) => ({ certificate: { ...c.certificate, ...patch } }));
}

export function issueCertificate(classId, studentId) {
  updateClass(classId, (c) => {
    if (c.certificate.issued.some((i) => i.studentId === studentId)) return {};
    const number = `ST-${new Date().getFullYear()}-${String(c.certificate.issued.length + 1).padStart(4, '0')}`;
    return {
      certificate: {
        ...c.certificate,
        issued: [...c.certificate.issued, { studentId, number, date: new Date().toISOString().slice(0, 10) }],
      },
    };
  });
}

export function revokeCertificate(classId, studentId) {
  updateCertificate(classId, {
    issued: classes.find((c) => c.id === classId).certificate.issued.filter((i) => i.studentId !== studentId),
  });
}

/* ---------- derived ---------- */

export function isEligible(cls, student) {
  const cert = cls.certificate;
  if (student.progress < cert.minProgress) return false;
  if (!cert.requireAllAssignments) return true;
  return cls.assignments
    .filter((a) => a.published)
    .every((a) => a.submissions.some((s) => s.studentId === student.id));
}

export function pendingSubmissions(cls) {
  return cls.assignments.flatMap((a) =>
    a.submissions
      .filter((s) => s.status === 'submitted')
      .map((s) => ({ ...s, assignment: a, student: cls.students.find((st) => st.id === s.studentId) }))
  );
}
