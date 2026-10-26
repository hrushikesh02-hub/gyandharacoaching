import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  ScanLine,
  Clock,
  Play,
  Check,
  Download,
  CalendarDays,
  Users,
} from "lucide-react";
import { useStore } from "../data/Store";
import {
  PageHead,
  PanelHead,
  Field,
  Avatar,
  Badge,
  Empty,
  DemoNote,
} from "../components/UI";
import {
  today,
  startSession,
  checkIn,
  attendanceFor,
  displayDate,
  exportCsv,
} from "../utils/domain";
function SessionCard({ session, onEnd, now }) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(session.code, {
      width: 220,
      margin: 1,
      color: { dark: "#173c3b", light: "#ffffff" },
    }).then((url) => live && setQr(url));
    return () => {
      live = false;
    };
  }, [session.code]);
  const seconds = Math.max(0, Math.ceil((session.endsAt - now) / 1000));
  return (
    <div className={`session-card ${seconds ? "" : "expired"}`}>
      <div className="session-top">
        <Badge>{seconds ? "Live session" : "Expired"}</Badge>
        <span>
          <Clock size={15} />
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </span>
      </div>
      {qr && (
        <img
          src={qr}
          alt={`Demo QR containing session code ${session.code}`}
          width="180"
          height="180"
        />
      )}
      <span className="eyebrow">DEMO SESSION CODE</span>
      <strong className="session-code">{session.code}</strong>
      <p>
        {seconds
          ? "Enter this code in the student portal to check in."
          : "This code is no longer accepting check-ins."}
      </p>
      {seconds > 0 && onEnd && (
        <button className="button secondary full" onClick={onEnd}>
          End session
        </button>
      )}
    </div>
  );
}
export default function Attendance({ student = false }) {
  const { db, auth, update, notify } = useStore();
  const s = db.students.find((s) => s.id === auth?.id);
  const [batch, setBatch] = useState(db.batches[0].id);
  const [date, setDate] = useState(today());
  const [period, setPeriod] = useState("day");
  const [month, setMonth] = useState(today().slice(0, 7));
  const [now, setNow] = useState(Date.now());
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All students");
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const session = db.sessions.find(
    (x) => x.batch === (student ? s.batch : batch),
  );
  const students = db.students.filter(
    (x) => x.batch === batch && x.status === "Active",
  );
  const rows = db.attendance.filter((a) =>
    period === "day" ? a.date === date : a.date.startsWith(month),
  );
  const present = students.filter((s) =>
    rows.some((a) => a.studentId === s.id && a.present),
  );
  const displayed = students.filter(
    (s) =>
      filter === "All students" ||
      (filter === "Present"
        ? present.some((x) => x.id === s.id)
        : !present.some((x) => x.id === s.id)),
  );
  function start() {
    try {
      update((d) => startSession(d, batch));
      notify("Attendance is open for 2 minutes. Share the demo code.");
    } catch (e) {
      notify(e.message, "error");
    }
  }
  function submit(e) {
    e.preventDefault();
    setError("");
    try {
      update((d) => checkIn(d, s.id, code));
      notify("You’re checked in. Welcome to class!");
      setCode("");
    } catch (e) {
      setError(e.message);
    }
  }
  const stat = student ? attendanceFor(db, s.id) : null;
  return (
    <>
      <PageHead
        eyebrow={
          student ? "SHOWING UP IS THE FIRST STEP" : "EVERY STUDENT COUNTS"
        }
        title={
          student
            ? "A little consistency. A lot of growth."
            : "Present, and ready to learn."
        }
        subtitle={
          student
            ? "Check in to your class and follow your attendance journey."
            : "Simple, session-based attendance for a connected classroom."
        }
      >
        {!student && (
          <button
            className="button secondary"
            onClick={() =>
              exportCsv(
                "gyandhara-attendance.csv",
                ["Date", "Name", "Class", "Attendance"],
                rows
                  .filter((a) => students.some((s) => s.id === a.studentId))
                  .map((a) => [
                    a.date,
                    db.students.find((s) => s.id === a.studentId)?.name,
                    db.students.find((s) => s.id === a.studentId)?.className,
                    a.present ? "Present" : "Absent",
                  ]),
              )
            }
          >
            <Download size={16} />
            Export attendance
          </button>
        )}
      </PageHead>
      <DemoNote>
        Simulated QR attendance · No camera or production anti-proxy
        verification. Codes work only with this browser’s demo data.
      </DemoNote>
      {student ? (
        <div className="attendance-layout">
          <section className="panel checkin-panel">
            <span className="auth-icon">
              <ScanLine size={28} />
            </span>
            <h2>Here. Ready. Let’s learn.</h2>
            <p>
              Ask your teacher for the active session code and enter it below.
            </p>
            <form onSubmit={submit}>
              <Field label="Session code">
                <input
                  className="code-input"
                  required
                  maxLength={6}
                  minLength={6}
                  placeholder="ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </Field>
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <button className="button full">
                <ScanLine size={17} />
                Check in to class
              </button>
            </form>
            <small>
              {session && session.endsAt > now
                ? "Your batch has an active session."
                : "No active session for your batch at the moment."}
            </small>
          </section>
          <section className="panel">
            <PanelHead
              title="Your attendance story"
              subtitle={`${stat.present} of ${stat.total} classes attended`}
            />
            <div className="attendance-score">
              <strong>
                {stat.percentage}
                <span>%</span>
              </strong>
              <p>
                {stat.percentage >= 85
                  ? "A lovely habit of showing up. Keep going!"
                  : "Every class is a new opportunity to grow."}
              </p>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>CLASS DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {db.attendance
                    .filter((a) => a.studentId === s.id)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((a) => (
                      <tr key={a.id}>
                        <td>{displayDate(a.date)}</td>
                        <td>
                          <Badge>{a.present ? "Present" : "Absent"}</Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!stat.total && <Empty title="Your first class is ahead" />}
          </section>
        </div>
      ) : (
        <div className="attendance-layout">
          <section className="panel session-panel">
            <PanelHead
              title="Open your classroom"
              subtitle="Start a two-minute check-in window"
            />
            <Field label="Select a batch">
              <select value={batch} onChange={(e) => setBatch(e.target.value)}>
                {db.batches.map((b) => (
                  <option value={b.id} key={b.id}>
                    {b.className} · {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="batch-time">
              <Clock size={16} />
              {db.batches.find((b) => b.id === batch)?.time}
            </div>
            {session && (
              <SessionCard
                session={session}
                now={now}
                onEnd={() => {
                  update((d) => ({
                    ...d,
                    sessions: d.sessions.map((x) =>
                      x.id === session.id ? { ...x, endsAt: Date.now() } : x,
                    ),
                  }));
                  notify("Session ended.");
                }}
              />
            )}
            {(!session || session.endsAt <= now) && (
              <button className="button full" onClick={start}>
                <Play size={17} />
                Start attendance session
              </button>
            )}
            <p className="helper-text">
              Students in this batch can check in once per day. New session
              records begin as absent until a check-in succeeds.
            </p>
          </section>
          <section className="panel attendance-register">
            <PanelHead
              title="The class register"
              subtitle="A clear view of who’s here"
            />
            <div className="toolbar">
              <div className="segmented">
                <button
                  className={period === "day" ? "active" : ""}
                  onClick={() => setPeriod("day")}
                >
                  Daily
                </button>
                <button
                  className={period === "month" ? "active" : ""}
                  onClick={() => setPeriod("month")}
                >
                  Monthly
                </button>
              </div>
              {period === "day" ? (
                <input
                  aria-label="Attendance date"
                  type="date"
                  value={date}
                  max={today()}
                  onChange={(e) => setDate(e.target.value)}
                />
              ) : (
                <input
                  aria-label="Attendance month"
                  type="month"
                  value={month}
                  max={today().slice(0, 7)}
                  onChange={(e) => setMonth(e.target.value)}
                />
              )}
            </div>
            <div className="attendance-totals">
              <div>
                <strong>{students.length}</strong>
                <span>In this batch</span>
              </div>
              <div>
                <strong className="green-text">{present.length}</strong>
                <span>
                  {period === "day" ? "Present" : "Attended this month"}
                </span>
              </div>
              <div>
                <strong className="amber-text">
                  {students.length - present.length}
                </strong>
                <span>
                  {rows.some((a) => students.some((s) => s.id === a.studentId))
                    ? "Absent"
                    : "Not recorded"}
                </span>
              </div>
            </div>
            <div className="filter-tabs">
              {["All students", "Present", "Absent"].map((f) => (
                <button
                  key={f}
                  className={filter === f ? "active" : ""}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>{period === "day" ? "STATUS" : "THIS MONTH"}</th>
                    <th>OVERALL</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((s) => {
                    const records = rows.filter((a) => a.studentId === s.id);
                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="person-cell">
                            <Avatar size="small" name={s.name} />
                            <strong>{s.name}</strong>
                          </div>
                        </td>
                        <td>
                          {period === "month" ? (
                            `${records.filter((a) => a.present).length} / ${records.length} classes`
                          ) : (
                            <Badge>
                              {records.length
                                ? records.some((a) => a.present)
                                  ? "Present"
                                  : "Absent"
                                : "Not recorded"}
                            </Badge>
                          )}
                        </td>
                        <td>{attendanceFor(db, s.id).percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!displayed.length && <Empty title="No students in this view" />}
          </section>
        </div>
      )}
    </>
  );
}
