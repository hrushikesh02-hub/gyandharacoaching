import React, { useState } from "react";
import { Plus, Megaphone, Edit3, Trash2, CalendarDays } from "lucide-react";
import { useStore } from "../data/Store";
import {
  PageHead,
  Modal,
  Confirm,
  Field,
  Badge,
  Empty,
  SearchInput,
} from "../components/UI";
import { CLASSES } from "../data/seed";
import { uid, today, displayDate, relevant } from "../utils/domain";
export default function Announcements({ student = false }) {
  const { db, auth, update, notify } = useStore();
  const own = db.students.find((s) => s.id === auth?.id);
  const [editing, setEditing] = useState(null);
  const [remove, setRemove] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All notices");
  const [error, setError] = useState("");
  const notices = db.announcements
    .filter(
      (n) =>
        (!student || (n.published && relevant(n, own))) &&
        (n.title + " " + n.body).toLowerCase().includes(query.toLowerCase()) &&
        (filter === "All notices" || n.type === filter),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  function save(e) {
    e.preventDefault();
    if (!editing.title.trim() || !editing.body.trim())
      return setError("Title and message cannot be blank.");
    update((d) => ({
      ...d,
      announcements: editing.id
        ? d.announcements.map((n) => (n.id === editing.id ? editing : n))
        : [{ ...editing, id: uid(), date: today() }, ...d.announcements],
    }));
    setEditing(null);
    notify("Announcement saved.");
  }
  return (
    <>
      <PageHead
        eyebrow="KEEPING EVERYONE IN THE LOOP"
        title="Good things to know."
        subtitle="Classroom news, important dates, and a little encouragement."
      >
        {!student && (
          <button
            className="button"
            onClick={() => {
              setError("");
              setEditing({
                title: "",
                body: "",
                className: "All classes",
                type: "Notice",
                published: true,
                eventDate: today(),
              });
            }}
          >
            <Plus size={17} />
            New announcement
          </button>
        )}
      </PageHead>
      <div className="toolbar library-toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search the notice board…"
        />
        <select
          aria-label="Notice type"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["All notices", "Notice", "Test", "Class update"].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>
      <div className="announcement-list">
        {notices.map((n) => (
          <article className="announcement-card" key={n.id}>
            <div
              className={`announcement-symbol ${n.type === "Test" ? "test-symbol" : ""}`}
            >
              <Megaphone size={25} />
            </div>
            <div className="announcement-copy">
              <div className="announcement-meta">
                <Badge>{n.type}</Badge>
                <span>{n.className}</span>
                {!student && (
                  <Badge>{n.published ? "Published" : "Draft"}</Badge>
                )}
              </div>
              <h2>{n.title}</h2>
              <p>{n.body}</p>
              <div className="announcement-date">
                <CalendarDays size={15} />
                {displayDate(n.eventDate)}
                <span>Posted {displayDate(n.date)}</span>
              </div>
            </div>
            {!student && (
              <div className="announcement-admin">
                <button
                  className="small-button"
                  onClick={() => {
                    update((d) => ({
                      ...d,
                      announcements: d.announcements.map((x) =>
                        x.id === n.id ? { ...x, published: !x.published } : x,
                      ),
                    }));
                    notify(
                      n.published
                        ? "Announcement unpublished."
                        : "Announcement published.",
                    );
                  }}
                >
                  {n.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  className="icon-button"
                  aria-label={`Edit ${n.title}`}
                  onClick={() => {
                    setError("");
                    setEditing(n);
                  }}
                >
                  <Edit3 size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Delete ${n.title}`}
                  onClick={() => setRemove(n)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {!notices.length && (
        <Empty
          title="All quiet on the notice board"
          description="New announcements will appear here."
        />
      )}
      {editing && (
        <Modal
          title={
            editing.id
              ? "Update the conversation"
              : "A message for your classroom"
          }
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save}>
            <Field label="Title">
              <input
                required
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </Field>
            <Field label="Message">
              <textarea
                required
                rows={5}
                value={editing.body}
                onChange={(e) =>
                  setEditing({ ...editing, body: e.target.value })
                }
              />
            </Field>
            <div className="form-grid">
              <Field label="Audience">
                <select
                  value={editing.className}
                  onChange={(e) =>
                    setEditing({ ...editing, className: e.target.value })
                  }
                >
                  {["All classes", ...CLASSES].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <select
                  value={editing.type}
                  onChange={(e) =>
                    setEditing({ ...editing, type: e.target.value })
                  }
                >
                  {["Notice", "Test", "Class update"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Event / important date">
                <input
                  type="date"
                  required
                  value={editing.eventDate}
                  onChange={(e) =>
                    setEditing({ ...editing, eventDate: e.target.value })
                  }
                />
              </Field>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) =>
                  setEditing({ ...editing, published: e.target.checked })
                }
              />
              Publish this announcement
            </label>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <div className="modal-actions">
              <button className="button">Save announcement</button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Confirm
          title="Remove this announcement?"
          danger
          onClose={() => setRemove(null)}
          onConfirm={() => {
            update((d) => ({
              ...d,
              announcements: d.announcements.filter((n) => n.id !== remove.id),
            }));
            setRemove(null);
            notify("Announcement removed.");
          }}
        >
          “{remove.title}” will be removed from the notice board.
        </Confirm>
      )}
    </>
  );
}
