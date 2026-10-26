import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Download,
  ArrowUpRight,
  Check,
  Edit3,
  UserRound,
  GraduationCap,
  Phone,
} from "lucide-react";
import { useStore } from "../data/Store";
import {
  PageHead,
  PanelHead,
  SearchInput,
  Badge,
  Avatar,
  Modal,
  Confirm,
  Empty,
} from "../components/UI";
import { StudentForm } from "./Public";
import {
  money,
  paidFor,
  balanceFor,
  attendanceFor,
  uid,
  today,
  displayDate,
  exportCsv,
} from "../utils/domain";
import { CLASSES } from "../data/seed";
export function ProfileDetails({ s, db }) {
  const a = attendanceFor(db, s.id);
  return (
    <>
      <div className="profile-hero">
        <Avatar name={s.name} />
        <div>
          <h2>{s.name}</h2>
          <p>
            {s.className} · {db.batches.find((b) => b.id === s.batch)?.name}
          </p>
          <Badge>{s.status}</Badge>
        </div>
      </div>
      <div className="profile-stats">
        <div>
          <small>Attendance</small>
          <strong>{a.percentage}%</strong>
        </div>
        <div>
          <small>Total fees</small>
          <strong>{money(s.fees)}</strong>
        </div>
        <div>
          <small>Paid</small>
          <strong>{money(paidFor(db, s.id))}</strong>
        </div>
        <div>
          <small>Outstanding</small>
          <strong>{money(balanceFor(db, s))}</strong>
        </div>
      </div>
      <dl className="detail-grid">
        {[
          ["Email", s.email],
          ["Mobile", s.mobile],
          ["School", s.school],
          ["Subjects", s.subjects.join(", ")],
          ["Parent / guardian", s.parentName],
          ["Parent mobile", s.parentMobile],
          ["Address", s.address],
          ["Joined", displayDate(s.joined)],
          ["Fee due date", displayDate(s.dueDate)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
export default function Students() {
  const { db, update, notify } = useStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(params.get("status") || "All statuses");
  const [className, setClassName] = useState("All classes");
  const [sort, setSort] = useState("name");
  const [editing, setEditing] = useState(params.has("add") ? {} : null);
  const [profile, setProfile] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const filtered = db.students
    .filter(
      (s) =>
        (s.name + " " + s.email + " " + s.mobile)
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === "All statuses" || s.status === status) &&
        (className === "All classes" || s.className === className),
    )
    .sort((a, b) =>
      sort === "joined"
        ? b.joined.localeCompare(a.joined)
        : a[sort].localeCompare(b[sort]),
    );
  function save(s) {
    if (
      db.students.some(
        (x) => x.id !== s.id && x.email.toLowerCase() === s.email,
      )
    )
      throw Error("This email is already registered.");
    if (s.fees < paidFor(db, s.id))
      throw Error("Fees cannot be lower than the amount already paid.");
    update((d) => ({
      ...d,
      students: s.id
        ? d.students.map((x) => (x.id === s.id ? s : x))
        : [
            ...d.students,
            { ...s, id: uid(), joined: today(), status: "Active" },
          ],
    }));
    setEditing(null);
    setParams({});
    notify(
      s.id ? "Student profile updated." : "Student added to your classroom.",
    );
  }
  function changeStatus(s, next) {
    setConfirm({ s, next });
  }
  function confirmStatus() {
    const { s, next } = confirm;
    update((d) => ({
      ...d,
      students: d.students.map((x) =>
        x.id === s.id ? { ...x, status: next } : x,
      ),
    }));
    notify(`${s.name}: ${next.toLowerCase()}.`);
    setConfirm(null);
  }
  return (
    <>
      <PageHead
        eyebrow="PEOPLE AT THE HEART OF IT"
        title="Your classroom, together."
        subtitle="A little guidance for every student. A clear view for you."
      >
        <button
          className="button secondary"
          onClick={() =>
            exportCsv(
              "gyandhara-students.csv",
              [
                "Name",
                "Email",
                "Class",
                "Batch",
                "Status",
                "Fees",
                "Paid",
                "Balance",
              ],
              filtered.map((s) => [
                s.name,
                s.email,
                s.className,
                db.batches.find((b) => b.id === s.batch)?.name,
                s.status,
                s.fees,
                paidFor(db, s.id),
                balanceFor(db, s),
              ]),
            )
          }
        >
          <Download size={16} />
          Export CSV
        </button>
        <button className="button" onClick={() => setEditing({})}>
          <Plus size={16} />
          Add student
        </button>
      </PageHead>
      <div className="summary-strip">
        <div>
          <strong>{db.students.length}</strong>
          <span>Total students</span>
        </div>
        <div>
          <strong>
            {db.students.filter((s) => s.status === "Active").length}
          </strong>
          <span>Active learners</span>
        </div>
        <div>
          <strong className="amber-text">
            {db.students.filter((s) => s.status === "Pending").length}
          </strong>
          <span>Awaiting approval</span>
        </div>
        <div>
          <strong>{db.batches.length}</strong>
          <span>Learning batches</span>
        </div>
      </div>
      <section className="panel">
        <div className="toolbar">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name, email or mobile…"
          />
          <div className="filters">
            <select
              aria-label="Filter by class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              {["All classes", ...CLASSES].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {[
                "All statuses",
                "Active",
                "Pending",
                "Inactive",
                "Rejected",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="Sort students"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name">Name A–Z</option>
              <option value="className">Class</option>
              <option value="joined">Newest first</option>
            </select>
          </div>
        </div>
        <div className="table-scroll">
          <table className="student-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>CLASS & BATCH</th>
                <th>ATTENDANCE</th>
                <th>BALANCE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <button
                      className="person-cell person-button"
                      onClick={() => setProfile(s.id)}
                    >
                      <Avatar name={s.name} />
                      <div>
                        <strong>{s.name}</strong>
                        <small>{s.email}</small>
                      </div>
                    </button>
                  </td>
                  <td>
                    <strong>{s.className}</strong>
                    <small>
                      {db.batches.find((b) => b.id === s.batch)?.name}
                    </small>
                  </td>
                  <td>
                    {attendanceFor(db, s.id).total ? (
                      <div className="attendance-inline">
                        <span>{attendanceFor(db, s.id).percentage}%</span>
                        <div className="progress-track">
                          <span
                            style={{
                              width: `${attendanceFor(db, s.id).percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="amount">{money(balanceFor(db, s))}</td>
                  <td>
                    <Badge>{s.status}</Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      {s.status === "Pending" ? (
                        <>
                          <button
                            className="small-button"
                            onClick={() => changeStatus(s, "Active")}
                          >
                            Approve
                          </button>
                          <button
                            className="text-button red-text"
                            onClick={() => changeStatus(s, "Rejected")}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          className="text-button"
                          onClick={() =>
                            changeStatus(
                              s,
                              s.status === "Active" ? "Inactive" : "Active",
                            )
                          }
                        >
                          {s.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      <button
                        className="icon-button"
                        title="Edit student"
                        aria-label={`Edit ${s.name}`}
                        onClick={() => setEditing(s)}
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <Empty
            title="No students match"
            description="Try a different search or change your filters."
          />
        )}
        <div className="table-footer">
          Showing {filtered.length} of {db.students.length} students
          <span>Academic year {db.settings.academicYear}</span>
        </div>
      </section>
      {editing && (
        <Modal
          wide
          title={editing.id ? "A little update" : "A new beginning"}
          subtitle="Student profile and enrollment details"
          onClose={() => {
            setEditing(null);
            setParams({});
          }}
        >
          <StudentForm
            admin
            initial={editing}
            onSave={save}
            onCancel={() => {
              setEditing(null);
              setParams({});
            }}
            batches={db.batches}
          />
        </Modal>
      )}
      {profile && (
        <Modal wide title="Student profile" onClose={() => setProfile(null)}>
          <ProfileDetails
            s={db.students.find((s) => s.id === profile)}
            db={db}
          />
          <div className="modal-actions">
            <button
              className="button"
              onClick={() => {
                setEditing(db.students.find((s) => s.id === profile));
                setProfile(null);
              }}
            >
              Edit profile
              <Edit3 size={16} />
            </button>
          </div>
        </Modal>
      )}
      {confirm && (
        <Confirm
          title={`${confirm.next === "Active" ? "Activate" : confirm.next === "Rejected" ? "Reject" : "Deactivate"} student?`}
          onClose={() => setConfirm(null)}
          onConfirm={confirmStatus}
          danger={confirm.next !== "Active"}
        >
          {confirm.s.name} will{" "}
          {confirm.next === "Active"
            ? "be able to access the student portal."
            : "lose access to the student portal. Their records will be retained."}
        </Confirm>
      )}
    </>
  );
}
