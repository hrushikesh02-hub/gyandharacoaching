import React, { useState } from "react";
import {
  Download,
  Printer,
  Plus,
  ChartNoAxesCombined,
  Users,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useStore } from "../data/Store";
import {
  PageHead,
  PanelHead,
  Modal,
  Field,
  Empty,
  Badge,
  Avatar,
} from "../components/UI";
import { CLASSES, SUBJECTS } from "../data/seed";
import {
  money,
  paidFor,
  balanceFor,
  attendanceFor,
  exportCsv,
  today,
  uid,
  displayDate,
} from "../utils/domain";
export default function Reports() {
  const { db, update, notify } = useStore();
  const [tab, setTab] = useState("Enrollment");
  const [className, setClassName] = useState("All classes");
  const [month, setMonth] = useState(today().slice(0, 7));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const students = db.students.filter(
    (s) => className === "All classes" || s.className === className,
  );
  const chart = CLASSES.map((c) => ({
    name: c,
    students: db.students.filter((s) => s.className === c).length,
  }));
  const monthly = db.attendance.filter(
    (a) =>
      a.date.startsWith(month) && students.some((s) => s.id === a.studentId),
  );
  const daily = [...new Set(monthly.map((a) => a.date))]
    .sort()
    .map((date) => ({
      date,
      present: monthly.filter((a) => a.date === date && a.present).length,
      absent: monthly.filter((a) => a.date === date && !a.present).length,
    }));
  const filteredResults = db.results.filter((r) =>
    students.some((s) => s.id === r.studentId),
  );
  let headers, rows;
  if (tab === "Enrollment") {
    headers = ["Student", "Class", "Batch", "Status", "Joined"];
    rows = students.map((s) => [
      s.name,
      s.className,
      db.batches.find((b) => b.id === s.batch)?.name,
      s.status,
      s.joined,
    ]);
  } else if (tab === "Attendance") {
    headers = [
      "Student",
      "Class",
      "Present (month)",
      "Sessions (month)",
      "Attendance % (month)",
      "Attendance % (all time)",
    ];
    rows = students.map((s) => {
      const r = monthly.filter((a) => a.studentId === s.id);
      return [
        s.name,
        s.className,
        r.filter((a) => a.present).length,
        r.length,
        r.length
          ? Math.round((r.filter((a) => a.present).length / r.length) * 100)
          : 0,
        attendanceFor(db, s.id).percentage,
      ];
    });
  } else if (tab === "Fees") {
    headers = [
      "Student",
      "Class",
      "Applicable fees",
      "Paid",
      "Outstanding",
      "Due date",
    ];
    rows = students.map((s) => [
      s.name,
      s.className,
      s.fees,
      paidFor(db, s.id),
      balanceFor(db, s),
      s.dueDate,
    ]);
  } else {
    headers = ["Student", "Assessment", "Subject", "Marks", "Out of", "Date"];
    rows = filteredResults.map((r) => [
      db.students.find((s) => s.id === r.studentId)?.name,
      r.title,
      r.subject,
      r.score,
      r.total,
      r.date,
    ]);
  }
  function save(e) {
    e.preventDefault();
    if (!result.title.trim()) return setError("Add an assessment title.");
    if (Number(result.score) > Number(result.total))
      return setError("Marks cannot exceed the maximum.");
    update((d) => ({
      ...d,
      results: [
        {
          ...result,
          id: uid(),
          score: Number(result.score),
          total: Number(result.total),
        },
        ...d.results,
      ],
    }));
    setResult(null);
    notify("Assessment result added to the student portal.");
  }
  return (
    <>
      <PageHead
        eyebrow="THE BIGGER PICTURE"
        title="See how far you’ve come."
        subtitle="Meaningful numbers. Thoughtful decisions. Steady progress."
      >
        <button className="button secondary" onClick={() => window.print()}>
          <Printer size={16} />
          Print report
        </button>
        <button
          className="button"
          onClick={() =>
            exportCsv(`gyandhara-${tab.toLowerCase()}.csv`, headers, rows)
          }
        >
          <Download size={16} />
          Export CSV
        </button>
      </PageHead>
      <div className="filter-tabs report-tabs">
        {["Enrollment", "Attendance", "Fees", "Exam results"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={t === tab ? "active" : ""}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="toolbar report-toolbar">
        <select
          aria-label="Report class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        >
          {["All classes", ...CLASSES].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {tab === "Attendance" && (
          <input
            type="month"
            aria-label="Report month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        )}{" "}
        {tab === "Exam results" && (
          <button
            className="button"
            onClick={() => {
              setError("");
              setResult({
                studentId: db.students[0].id,
                title: "Monthly assessment",
                subject: "Mathematics",
                score: "",
                total: 100,
                date: today(),
              });
            }}
          >
            <Plus size={16} />
            Add result
          </button>
        )}
      </div>
      <div className="print-area">
        <div className="print-heading">
          <h2>Gyandhara Coaching Classes</h2>
          <p>
            {tab} report · {className} · {displayDate(today())}
          </p>
        </div>
        {tab === "Enrollment" && (
          <section className="panel report-chart">
            <PanelHead
              title="Every class, a new possibility"
              subtitle="Class-wise enrollment including pending and inactive records"
            />
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ left: -25, right: 15 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 5" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="students"
                    name="Students"
                    fill="#477e72"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={65}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
        {tab === "Fees" && (
          <div className="summary-strip">
            <div>
              <strong>{money(students.reduce((a, s) => a + s.fees, 0))}</strong>
              <span>Total applicable</span>
            </div>
            <div>
              <strong className="green-text">
                {money(students.reduce((a, s) => a + paidFor(db, s.id), 0))}
              </strong>
              <span>Collected</span>
            </div>
            <div>
              <strong className="amber-text">
                {money(students.reduce((a, s) => a + balanceFor(db, s), 0))}
              </strong>
              <span>Outstanding</span>
            </div>
          </div>
        )}
        {tab === "Attendance" && (
          <section className="panel daily-report">
            <PanelHead
              title="A month of showing up"
              subtitle="Daily attendance summary"
            />
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Total recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((d) => (
                    <tr key={d.date}>
                      <td>{displayDate(d.date)}</td>
                      <td className="green-text">{d.present}</td>
                      <td>{d.absent}</td>
                      <td>{d.present + d.absent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!daily.length && <Empty title="No attendance in this month" />}
          </section>
        )}
        <section className="panel">
          <PanelHead
            title={
              tab === "Attendance" ? "Student-wise attendance" : `${tab} report`
            }
            subtitle={`${rows.length} records · ${className}`}
          />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>
                        {tab === "Fees" && j >= 2 && j <= 4
                          ? money(cell)
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <Empty title="No records for this view" />}
        </section>
      </div>
      {result && (
        <Modal
          title="A milestone worth recording"
          subtitle="Add an assessment result to a student’s profile"
          onClose={() => setResult(null)}
        >
          <form onSubmit={save}>
            <Field label="Student">
              <select
                value={result.studentId}
                onChange={(e) =>
                  setResult({ ...result, studentId: e.target.value })
                }
              >
                {db.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.className}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assessment title">
              <input
                required
                value={result.title}
                onChange={(e) =>
                  setResult({ ...result, title: e.target.value })
                }
              />
            </Field>
            <div className="form-grid">
              <Field label="Subject">
                <select
                  value={result.subject}
                  onChange={(e) =>
                    setResult({ ...result, subject: e.target.value })
                  }
                >
                  {SUBJECTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Assessment date">
                <input
                  required
                  type="date"
                  value={result.date}
                  max={today()}
                  onChange={(e) =>
                    setResult({ ...result, date: e.target.value })
                  }
                />
              </Field>
              <Field label="Marks scored">
                <input
                  required
                  type="number"
                  min="0"
                  max={result.total}
                  value={result.score}
                  onChange={(e) =>
                    setResult({ ...result, score: e.target.value })
                  }
                />
              </Field>
              <Field label="Maximum marks">
                <input
                  required
                  type="number"
                  min="1"
                  value={result.total}
                  onChange={(e) =>
                    setResult({ ...result, total: e.target.value })
                  }
                />
              </Field>
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="modal-actions">
              <button className="button">Save result</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
