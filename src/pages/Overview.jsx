import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ArrowUpRight,
  ArrowRight,
  Plus,
  ScanLine,
  IndianRupee,
  CalendarDays,
  Clock,
  Check,
  BookOpen,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useStore } from "../data/Store";
import {
  PageHead,
  PanelHead,
  Avatar,
  Badge,
  Empty,
  TextLink,
} from "../components/UI";
import {
  money,
  today,
  paidFor,
  balanceFor,
  attendanceFor,
  displayDate,
  relevant,
  exportCsv,
} from "../utils/domain";
export function CollectionChart({ db }) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      amount: db.payments
        .filter((p) => p.date.startsWith(prefix))
        .reduce((a, p) => a + p.amount, 0),
    };
  });
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={months}
          margin={{ top: 15, right: 14, bottom: 0, left: -18 }}
        >
          <defs>
            <linearGradient id="collectionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3e8073" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#3e8073" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 5"
            vertical={false}
            stroke="#e9e9e3"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#7b8386", fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v / 1000}k`}
            tick={{ fill: "#7b8386", fontSize: 10 }}
          />
          <Tooltip
            formatter={(v) => [money(v), "Collected"]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e3e7df",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            isAnimationActive={false}
            dataKey="amount"
            stroke="#37786c"
            strokeWidth={2.5}
            fill="url(#collectionFill)"
            dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function Metric({ label, value, detail, icon: Icon, tone = "", link }) {
  return (
    <div className={`metric ${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">
          <Icon size={19} />
        </span>
      </div>
      <strong>{value}</strong>
      <div className="metric-bottom">
        {detail}
        {link && (
          <Link to={link} aria-label={`View ${label}`}>
            <ArrowUpRight size={17} />
          </Link>
        )}
      </div>
    </div>
  );
}
export function AdminOverview() {
  const { db, update, notify } = useStore();
  const pending = db.students.filter((s) => s.status === "Pending");
  const active = db.students.filter((s) => s.status === "Active");
  const attendance = db.attendance.filter(
    (a) => a.date === today() && active.some((s) => s.id === a.studentId),
  );
  const present = attendance.filter((a) => a.present).length;
  const collected = db.payments.reduce((a, p) => a + p.amount, 0);
  const outstanding = db.students.reduce((a, s) => a + balanceFor(db, s), 0);
  const notices = db.announcements
    .filter((a) => a.published && a.eventDate >= today())
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  function approve(id) {
    update((d) => ({
      ...d,
      students: d.students.map((s) =>
        s.id === id ? { ...s, status: "Active" } : s,
      ),
    }));
    notify("Student approved. Their portal is ready.");
  }
  return (
    <>
      <PageHead
        eyebrow="A LITTLE PROGRESS, EVERY DAY"
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, Meera ☀`}
        subtitle="Here’s what’s happening at Gyandhara today."
      >
        <span className="date-pill">
          <CalendarDays size={16} />
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <Link className="button" to="/admin/students?add=1">
          <Plus size={16} />
          Add student
        </Link>
      </PageHead>
      <section className="welcome-banner">
        <div>
          <span className="banner-label">YOUR CLASSROOM, CONNECTED</span>
          <h2>
            Less paperwork.
            <br />
            <em>More possibility.</em>
          </h2>
          <p>A clear view of your institute, so you can focus on teaching.</p>
          <Link to="/admin/attendance">
            Start today’s attendance <ArrowRight size={17} />
          </Link>
        </div>
        <div className="banner-illustration" aria-hidden="true">
          <div className="banner-ring" />
          <span className="banner-star">✳</span>
          <div className="mini-book">
            <span />
            <span />
          </div>
          <div className="pencil" />
          <span className="banner-spark">✧</span>
          <small>GROWING TOGETHER</small>
        </div>
        <div className="banner-right">
          <span className="live-dot" /> ACADEMIC YEAR {db.settings.academicYear}
          <strong>
            {active.length}
            <span>
              curious minds.
              <br />
              endless potential.
            </span>
          </strong>
        </div>
      </section>
      <div className="metrics-grid">
        <Metric
          label="Total students"
          value={db.students.length}
          icon={Users}
          detail={
            <>
              <span className="green-text">{active.length} active</span>
              <span>across 4 batches</span>
            </>
          }
          link="/admin/students"
        />
        <Metric
          label="Today’s attendance"
          value={`${present} / ${active.length}`}
          icon={ScanLine}
          detail={
            <>
              <span className="green-text">
                {active.length
                  ? Math.round((present / active.length) * 100)
                  : 0}
                %
              </span>
              <span>present today</span>
            </>
          }
          link="/admin/attendance"
        />
        <Metric
          label="Fees collected"
          value={money(collected)}
          icon={IndianRupee}
          detail={
            <>
              <span className="green-text">{db.payments.length} payments</span>
              <span>this academic year</span>
            </>
          }
          link="/admin/fees"
        />
        <Metric
          label="Outstanding fees"
          value={money(outstanding)}
          icon={Clock}
          tone="warm"
          detail={
            <>
              <span className="amber-text">
                {db.students.filter((s) => balanceFor(db, s) > 0).length}{" "}
                students
              </span>
              <span>with a balance</span>
            </>
          }
          link="/admin/fees"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel collection-panel">
          <PanelHead
            title="A steady stream of progress"
            subtitle="Fee collection over the last 6 months"
          >
            <span className="chart-legend">
              <i />
              Fees collected
            </span>
          </PanelHead>
          <div className="chart-summary">
            <strong>{money(collected)}</strong>
            <span>Total collected this year</span>
          </div>
          <CollectionChart db={db} />
        </section>
        <section className="panel approvals-panel">
          <PanelHead
            title="New beginnings"
            subtitle="Students waiting to join your classroom"
          >
            <span className="count-pill">{pending.length} pending</span>
          </PanelHead>
          <div className="approval-list">
            {pending.length ? (
              pending.slice(0, 3).map((s) => (
                <div className="approval-row" key={s.id}>
                  <Avatar name={s.name} />
                  <div>
                    <strong>{s.name}</strong>
                    <small>
                      {s.className} ·{" "}
                      {db.batches.find((b) => b.id === s.batch)?.name}
                    </small>
                  </div>
                  <button
                    className="approve-button"
                    onClick={() => approve(s.id)}
                    aria-label={`Approve ${s.name}`}
                    title="Approve student"
                  >
                    <Check size={17} />
                  </button>
                </div>
              ))
            ) : (
              <Empty
                title="Everyone’s all set"
                description="There are no pending registrations."
              />
            )}
          </div>
          <Link
            className="panel-footer-link"
            to="/admin/students?status=Pending"
          >
            Review registrations
            <ArrowRight size={16} />
          </Link>
        </section>
        <section className="panel transactions-panel">
          <PanelHead
            title="Recent payments"
            subtitle="Every contribution, accounted for"
          >
            <TextLink to="/admin/fees">View all</TextLink>
          </PanelHead>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>AMOUNT</th>
                  <th>METHOD</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {db.payments.slice(0, 4).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="person-cell">
                        <Avatar
                          size="small"
                          name={
                            db.students.find((s) => s.id === p.studentId)
                              ?.name || "Student"
                          }
                        />
                        <div>
                          <strong>
                            {
                              db.students.find((s) => s.id === p.studentId)
                                ?.name
                            }
                          </strong>
                          <small>{p.receipt}</small>
                        </div>
                      </div>
                    </td>
                    <td className="amount">{money(p.amount)}</td>
                    <td>
                      <Badge>{p.method}</Badge>
                    </td>
                    <td className="muted">{displayDate(p.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel notices-panel">
          <PanelHead
            title="On the horizon"
            subtitle="A little preparation for what’s next"
          >
            <Link
              aria-label="View all announcements"
              className="icon-button"
              to="/admin/announcements"
            >
              <ArrowUpRight size={19} />
            </Link>
          </PanelHead>
          {notices.slice(0, 3).map((a) => (
            <Link to="/admin/announcements" key={a.id} className="notice-row">
              <div
                className={`date-block ${a.type === "Test" ? "saffron-date" : ""}`}
              >
                <strong>{new Date(a.eventDate + "T12:00:00").getDate()}</strong>
                <span>
                  {new Date(a.eventDate + "T12:00:00").toLocaleDateString(
                    "en-IN",
                    { month: "short" },
                  )}
                </span>
              </div>
              <div>
                <small>
                  {a.type.toUpperCase()} · {a.className}
                </small>
                <h3>{a.title}</h3>
              </div>
              <ChevronRight size={16} />
            </Link>
          ))}
          {!notices.length && <Empty title="A clear calendar" />}
        </section>
      </div>
      <div className="closing-note">
        <span>✧</span> Great teaching starts with a little care. You’re in the
        right place.
      </div>
    </>
  );
}
export function StudentOverview() {
  const { db, auth } = useStore();
  const s = db.students.find((x) => x.id === auth.id);
  const a = attendanceFor(db, s.id);
  const notes = db.notes.filter((n) => n.published && relevant(n, s));
  const notices = db.announcements.filter(
    (n) => n.published && relevant(n, s) && n.eventDate >= today(),
  );
  const results = db.results.filter((r) => r.studentId === s.id);
  return (
    <>
      <PageHead
        eyebrow="YOUR LEARNING JOURNEY"
        title={`Hello, ${s.name.split(" ")[0]} ☀`}
        subtitle="One step forward is still a step forward. Let’s make today count."
      >
        <Link className="button" to="/student/attendance">
          <ScanLine size={17} />
          Check in to class
        </Link>
      </PageHead>
      <section className="welcome-banner student-banner">
        <div>
          <span className="banner-label">
            {s.className.toUpperCase()} ·{" "}
            {db.batches.find((b) => b.id === s.batch)?.name.toUpperCase()}
          </span>
          <h2>
            Your potential.
            <br />
            <em>A little more, every day.</em>
          </h2>
          <p>{s.subjects.join(" · ")}</p>
          <Link to="/student/materials">
            Pick up something new <ArrowRight size={17} />
          </Link>
        </div>
        <div className="banner-illustration" aria-hidden="true">
          <div className="banner-ring" />
          <span className="banner-star">✳</span>
          <div className="mini-book">
            <span />
            <span />
          </div>
          <span className="banner-spark">✧</span>
        </div>
      </section>
      <div className="metrics-grid student-metrics">
        <Metric
          label="Your attendance"
          value={`${a.percentage}%`}
          icon={ScanLine}
          detail={
            <span>
              {a.present} of {a.total} classes attended
            </span>
          }
          link="/student/attendance"
        />
        <Metric
          label="Outstanding fees"
          value={money(balanceFor(db, s))}
          icon={IndianRupee}
          detail={<span>Due {displayDate(s.dueDate)}</span>}
          link="/student/fees"
        />
        <Metric
          label="Learning resources"
          value={notes.length}
          icon={BookOpen}
          detail={<span>Ready for your next revision</span>}
          link="/student/materials"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <PanelHead
            title="Keep your curiosity going"
            subtitle="Your latest study materials"
          >
            <TextLink to="/student/materials">Browse all</TextLink>
          </PanelHead>
          {notes.slice(0, 3).map((n) => (
            <Link to="/student/materials" className="resource-row" key={n.id}>
              <span className="resource-icon">
                <BookOpen size={22} />
              </span>
              <div>
                <small>
                  {n.subject} · {n.chapter}
                </small>
                <h3>{n.title}</h3>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))}
          {!notes.length && (
            <Empty
              title="New resources are on their way"
              description="Your teacher’s published materials will appear here."
            />
          )}
        </section>
        <section className="panel">
          <PanelHead
            title="On your calendar"
            subtitle="Tests, class updates and little reminders"
          />
          {notices.map((n) => (
            <Link to="/student/announcements" className="notice-row" key={n.id}>
              <div className="date-block">
                <strong>{new Date(n.eventDate + "T12:00:00").getDate()}</strong>
                <span>
                  {new Date(n.eventDate + "T12:00:00").toLocaleDateString(
                    "en-IN",
                    { month: "short" },
                  )}
                </span>
              </div>
              <div>
                <small>{n.type}</small>
                <h3>{n.title}</h3>
              </div>
              <ChevronRight size={16} />
            </Link>
          ))}
          {!notices.length && <Empty title="No upcoming notices" />}
        </section>
        <section className="panel">
          <PanelHead
            title="Your progress, in perspective"
            subtitle="Assessment results · marks earned / maximum marks"
          />
          {results.map((r) => (
            <div className="progress-row" key={r.id}>
              <div>
                <strong>{r.subject}</strong>
                <span>
                  {r.score} / {r.total}
                </span>
              </div>
              <div className="progress-track">
                <span style={{ width: `${(r.score / r.total) * 100}%` }} />
              </div>
            </div>
          ))}
          {!results.length && (
            <Empty
              title="Your story is just beginning"
              description="Assessment results will appear here when your teacher adds them."
            />
          )}
        </section>
        <section className="panel batch-panel">
          <PanelHead
            title="Your classroom"
            subtitle={db.batches.find((b) => b.id === s.batch)?.name}
          />
          <GraduationInfo s={s} db={db} />
        </section>
      </div>
    </>
  );
}
function GraduationInfo({ s, db }) {
  const b = db.batches.find((b) => b.id === s.batch);
  return (
    <div className="batch-details">
      <p>
        <CalendarDays size={20} />
        <span>
          <small>CLASS DAYS</small>
          <strong>{b?.days}</strong>
        </span>
      </p>
      <p>
        <Clock size={20} />
        <span>
          <small>BATCH TIMING</small>
          <strong>{b?.time}</strong>
        </span>
      </p>
      <p>
        <BookOpen size={20} />
        <span>
          <small>YOUR SCHOOL</small>
          <strong>{s.school}</strong>
        </span>
      </p>
    </div>
  );
}
