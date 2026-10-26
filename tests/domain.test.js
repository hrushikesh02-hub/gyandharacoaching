import test from "node:test";
import assert from "node:assert/strict";
import { createSeed } from "../src/data/seed.js";
import {
  recordPayment,
  paidFor,
  balanceFor,
  feeStatus,
  checkIn,
  startSession,
  today,
  attendanceFor,
  relevant,
} from "../src/utils/domain.js";
test("seed has 20 consistent students across 4 batches, with pending registrations", () => {
  const db = createSeed();
  assert.equal(db.students.length, 20);
  assert.equal(db.batches.length, 4);
  assert.equal(db.students.filter((s) => s.status === "Pending").length, 3);
  for (const s of db.students) {
    assert.equal(s.fees, paidFor(db, s.id) + balanceFor(db, s));
    assert.ok(
      db.batches.some((b) => b.id === s.batch && b.className === s.className),
    );
    assert.ok(attendanceFor(db, s.id).percentage <= 100);
  }
  for (const p of db.payments)
    assert.ok(db.students.some((s) => s.id === p.studentId));
});
test("successful partial and final payments maintain a consistent ledger and receipt", () => {
  const db = createSeed();
  const s = db.students.find((s) => balanceFor(db, s) > 1000);
  const before = balanceFor(db, s);
  const { db: next, payment } = recordPayment(db, {
    studentId: s.id,
    amount: 1000,
    method: "UPI",
  });
  assert.equal(balanceFor(next, s), before - 1000);
  assert.equal(db.payments.length + 1, next.payments.length);
  assert.ok(payment.receipt.startsWith("GY-"));
  const { db: paid } = recordPayment(next, {
    studentId: s.id,
    amount: before - 1000,
    method: "Cash",
  });
  assert.equal(balanceFor(paid, s), 0);
  assert.equal(feeStatus(paid, s), "Paid");
});
test("invalid payments never modify the source ledger", () => {
  const db = createSeed();
  const snapshot = JSON.stringify(db);
  for (const amount of [-1, 0, NaN, Infinity, 99999999])
    assert.throws(() =>
      recordPayment(db, { studentId: "s2", amount, method: "Cash" }),
    );
  assert.throws(() =>
    recordPayment(db, { studentId: "missing", amount: 1, method: "UPI" }),
  );
  assert.throws(() =>
    recordPayment(db, { studentId: "s2", amount: 1, method: "Crypto" }),
  );
  assert.equal(JSON.stringify(db), snapshot);
});
test("session check-in enforces active status, batch, expiry and duplicate checks", () => {
  let db = createSeed();
  db.attendance = db.attendance.filter((a) => a.date !== today());
  db = startSession(db, "b8", 120);
  const session = db.sessions[0];
  assert.throws(() => startSession(db, "b8", 120), /already/);
  assert.throws(() => checkIn(db, "s2", session.code), /different batch/);
  assert.throws(() => checkIn(db, "s17", session.code), /approved/);
  assert.throws(() => checkIn(db, "s1", "BAD123"), /not found/);
  assert.throws(
    () => checkIn(db, "s1", session.code, session.endsAt),
    /expired/,
  );
  const next = checkIn(db, "s1", session.code);
  assert.equal(
    next.attendance.filter(
      (a) => a.studentId === "s1" && a.date === today() && a.present,
    ).length,
    1,
  );
  assert.throws(() => checkIn(next, "s1", session.code), /already/);
});
test("relevance separates class resources and all-student notices", () => {
  const s = { className: "Class 8" };
  assert.ok(relevant({ className: "Class 8" }, s));
  assert.ok(relevant({ className: "All classes" }, s));
  assert.equal(relevant({ className: "Class 10" }, s), false);
});
test("paise are recorded and balanced without floating-point drift", () => {
  const db = createSeed();
  const s = db.students[1];
  const before = balanceFor(db, s);
  const first = recordPayment(db, {
    studentId: s.id,
    amount: 0.29,
    method: "UPI",
  });
  const second = recordPayment(first.db, {
    studentId: s.id,
    amount: 0.01,
    method: "UPI",
  });
  assert.equal(balanceFor(second.db, s), before - 0.3);
  assert.throws(
    () => recordPayment(db, { studentId: s.id, amount: 0.001, method: "UPI" }),
    /decimal/,
  );
});
