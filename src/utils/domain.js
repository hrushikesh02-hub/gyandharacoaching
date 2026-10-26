export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);
export const today = () => localDate(new Date());
export function localDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const displayDate = (d) =>
  d
    ? new Date(d + "T12:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const paidFor = (db, id) =>
  db.payments
    .filter((p) => p.studentId === id)
    .reduce((sum, p) => sum + Math.round(p.amount * 100), 0) / 100;
export const balanceFor = (db, s) =>
  Math.max(0, Math.round(s.fees * 100) - Math.round(paidFor(db, s.id) * 100)) /
  100;
export function feeStatus(db, s) {
  const paid = paidFor(db, s.id);
  if (paid >= s.fees) return "Paid";
  if (s.dueDate < today()) return "Overdue";
  return paid > 0 ? "Partial" : "Pending";
}
export function attendanceFor(db, id) {
  const rows = db.attendance.filter((a) => a.studentId === id);
  return {
    present: rows.filter((a) => a.present).length,
    total: rows.length,
    percentage: rows.length
      ? Math.round((rows.filter((a) => a.present).length / rows.length) * 100)
      : 0,
  };
}
export function recordPayment(
  db,
  { studentId, amount, method, date = today() },
) {
  const s = db.students.find((s) => s.id === studentId);
  const n = Number(amount);
  if (!s) throw Error("Student not found.");
  if (!Number.isFinite(n) || n <= 0)
    throw Error("Enter an amount greater than zero.");
  if (Math.abs(Math.round(n * 100) - n * 100) > 0.000001)
    throw Error("Use at most two decimal places.");
  if (n > balanceFor(db, s))
    throw Error("Amount exceeds the outstanding balance.");
  if (!["Cash", "UPI", "Bank transfer"].includes(method))
    throw Error("Choose a valid payment method.");
  const payment = {
    id: uid(),
    receipt: `GY-${Date.now().toString().slice(-9)}`,
    studentId,
    amount: Math.round(n * 100) / 100,
    method,
    date,
  };
  return { db: { ...db, payments: [payment, ...db.payments] }, payment };
}
export function checkIn(db, studentId, code, now = Date.now()) {
  const s = db.students.find((s) => s.id === studentId);
  if (!s || s.status !== "Active")
    throw Error("Only approved, active students can check in.");
  const session = db.sessions.find((x) => x.code === code.trim().toUpperCase());
  if (!session)
    throw Error("Session code not found. Check the code with your teacher.");
  if (session.endsAt <= now)
    throw Error("This attendance session has expired.");
  if (session.batch !== s.batch)
    throw Error("This session is for a different batch.");
  if (
    db.attendance.some(
      (a) => a.studentId === studentId && a.date === session.date && a.present,
    )
  )
    throw Error("You have already checked in today.");
  const rows = db.attendance.filter(
    (a) => !(a.studentId === studentId && a.date === session.date),
  );
  return {
    ...db,
    attendance: [
      {
        id: uid(),
        studentId,
        date: session.date,
        present: true,
        sessionId: session.id,
      },
      ...rows,
    ],
  };
}
export function startSession(db, batch, duration = 120, now = Date.now()) {
  if (!db.batches.some((b) => b.id === batch)) throw Error("Choose a batch.");
  const active = db.sessions.find((s) => s.batch === batch && s.endsAt > now);
  if (active) throw Error("This batch already has a live session.");
  const date = today();
  const session = {
    id: uid(),
    batch,
    date,
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    endsAt: now + duration * 1000,
  };
  const rows = db.students
    .filter(
      (s) =>
        s.batch === batch &&
        s.status === "Active" &&
        !db.attendance.some((a) => a.studentId === s.id && a.date === date),
    )
    .map((s) => ({
      id: uid(),
      studentId: s.id,
      date,
      present: false,
      sessionId: session.id,
    }));
  return {
    ...db,
    sessions: [session, ...db.sessions],
    attendance: [...rows, ...db.attendance],
  };
}
export const relevant = (item, s) =>
  item.className === "All classes" || item.className === s.className;
export function downloadFile(name, content, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCsv(name, headers, rows) {
  const cell = (v) => {
    let text = String(v ?? "");
    if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  downloadFile(
    name,
    "\uFEFF" +
      [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
}
