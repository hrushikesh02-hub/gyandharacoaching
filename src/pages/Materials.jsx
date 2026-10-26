import React, { useState } from "react";
import {
  Plus,
  BookOpen,
  Download,
  Eye,
  Edit3,
  Trash2,
  Upload,
  FileText,
  Image,
  ArrowUpRight,
} from "lucide-react";
import { useStore } from "../data/Store";
import {
  PageHead,
  SearchInput,
  Modal,
  Confirm,
  Field,
  Badge,
  Empty,
  DemoNote,
} from "../components/UI";
import { CLASSES, SUBJECTS } from "../data/seed";
import {
  uid,
  today,
  displayDate,
  relevant,
  downloadFile,
} from "../utils/domain";
export default function Materials({ student = false }) {
  const { db, auth, update, notify } = useStore();
  const own = db.students.find((s) => s.id === auth?.id);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All subjects");
  const [className, setClassName] = useState("All classes");
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState(null);
  const [remove, setRemove] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const notes = db.notes.filter(
    (n) =>
      (!student || (n.published && relevant(n, own))) &&
      (n.title + " " + n.chapter).toLowerCase().includes(query.toLowerCase()) &&
      (subject === "All subjects" || n.subject === subject) &&
      (className === "All classes" || n.className === className),
  );
  function start(n) {
    setError("");
    setEditing(
      n || {
        title: "",
        className: "Class 8",
        subject: "Mathematics",
        chapter: "",
        description: "",
        published: true,
        kind: "Study guide",
        fileName: "",
        content: "",
        dataUrl: "",
      },
    );
  }
  async function fileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(
        file.type,
      )
    ) {
      setError("Choose a PDF, PNG, JPEG or WebP file.");
      return;
    }
    if (file.size > 800000) {
      setError("Choose a file under 800 KB to fit browser demo storage.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setEditing((v) => ({
        ...v,
        dataUrl,
        fileName: file.name,
        mime: file.type,
        content: "",
      }));
    } catch {
      setError("We could not read this file. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function save(e) {
    e.preventDefault();
    if (!editing.title.trim() || !editing.description.trim())
      return setError("Add a title and description.");
    if (!editing.fileName)
      return setError("Attach a PDF or image before publishing.");
    const total =
      db.notes
        .filter((n) => n.id !== editing.id)
        .reduce((a, n) => a + (n.dataUrl?.length || 0), 0) +
      (editing.dataUrl?.length || 0);
    if (total > 2500000)
      return setError(
        "Demo attachment storage is full. Remove an older attachment first.",
      );
    update((d) => ({
      ...d,
      notes: editing.id
        ? d.notes.map((n) =>
            n.id === editing.id
              ? { ...editing, title: editing.title.trim() }
              : n,
          )
        : [
            {
              ...editing,
              title: editing.title.trim(),
              id: uid(),
              date: today(),
            },
            ...d.notes,
          ],
    }));
    setEditing(null);
    notify("Learning resource saved.");
  }
  function download(n) {
    if (n.dataUrl) {
      const a = document.createElement("a");
      a.href = n.dataUrl;
      a.download = n.fileName;
      a.click();
    } else downloadFile(n.fileName, n.content);
    notify("Resource download started.");
  }
  return (
    <>
      <PageHead
        eyebrow="A LITTLE KNOWLEDGE GOES A LONG WAY"
        title={
          student
            ? "Room for a little more learning."
            : "Good lessons. Always within reach."
        }
        subtitle={
          student
            ? "Notes, guides and practice, picked for your class."
            : "A thoughtful library for curious minds."
        }
      >
        {!student && (
          <button className="button" onClick={() => start()}>
            <Plus size={17} />
            Add study material
          </button>
        )}
      </PageHead>
      <div className="library-banner">
        <BookOpen size={38} />
        <div>
          <h2>Understanding grows with practice.</h2>
          <p>
            {student
              ? "Your teacher’s published resources, ready when you are."
              : "Share the right resources. Keep the learning going."}
          </p>
        </div>
        <span>
          {notes.length}
          <small>RESOURCES</small>
        </span>
      </div>
      <div className="toolbar library-toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Find a lesson, chapter or resource…"
        />
        <div className="filters">
          {!student && (
            <select
              aria-label="Resource class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              {["All classes", ...CLASSES].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
          <select
            aria-label="Resource subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {["All subjects", ...SUBJECTS].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="materials-grid">
        {notes.map((n, i) => (
          <article className="material-card" key={n.id}>
            <div
              className={`material-cover cover-${SUBJECTS.indexOf(n.subject) % 4}`}
            >
              <div>
                <span>{n.subject.toUpperCase()}</span>
                <strong>{n.chapter}</strong>
              </div>
              <span className="cover-symbol">
                {n.subject === "Mathematics"
                  ? "ƒx"
                  : n.subject === "Science"
                    ? "✳"
                    : "Aa"}
              </span>
              <small>{n.kind.toUpperCase()}</small>
              {!student && <Badge>{n.published ? "Published" : "Draft"}</Badge>}
            </div>
            <div className="material-body">
              <div className="resource-meta">
                {n.className}
                <span>·</span>
                {n.fileName?.split(".").pop().toUpperCase()}
                <span>·</span>
                {displayDate(n.date)}
              </div>
              <h2>{n.title}</h2>
              <p>{n.description}</p>
              <div className="material-actions">
                <button className="text-button" onClick={() => setView(n)}>
                  <Eye size={16} />
                  View resource
                </button>
                <button
                  className="icon-button"
                  onClick={() => download(n)}
                  aria-label={`Download ${n.title}`}
                >
                  <Download size={18} />
                </button>
              </div>
              {!student && (
                <div className="material-admin">
                  <button
                    className="text-button"
                    onClick={() => {
                      update((d) => ({
                        ...d,
                        notes: d.notes.map((x) =>
                          x.id === n.id ? { ...x, published: !x.published } : x,
                        ),
                      }));
                      notify(
                        n.published
                          ? "Resource moved to drafts."
                          : "Resource published to its class.",
                      );
                    }}
                  >
                    {n.published ? "Unpublish" : "Publish"}
                  </button>
                  <div>
                    <button
                      className="icon-button"
                      aria-label={`Edit ${n.title}`}
                      onClick={() => start(n)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete ${n.title}`}
                      onClick={() => setRemove(n)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      {!notes.length && (
        <Empty
          title="A little room for something new"
          description="Try a different filter, or check back for new class resources."
        />
      )}
      <DemoNote>
        Files and metadata are saved only in this browser’s local storage,
        subject to storage limits. They are not uploaded, synced or permanently
        hosted.
      </DemoNote>
      {editing && (
        <Modal
          title={
            editing.id ? "Refine a learning resource" : "Something new to learn"
          }
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save}>
            <Field label="Resource title">
              <input
                required
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </Field>
            <div className="form-grid">
              <Field label="Class">
                <select
                  value={editing.className}
                  onChange={(e) =>
                    setEditing({ ...editing, className: e.target.value })
                  }
                >
                  {CLASSES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Subject">
                <select
                  value={editing.subject}
                  onChange={(e) =>
                    setEditing({ ...editing, subject: e.target.value })
                  }
                >
                  {SUBJECTS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Chapter">
                <input
                  required
                  placeholder="e.g. Chapter 4"
                  value={editing.chapter}
                  onChange={(e) =>
                    setEditing({ ...editing, chapter: e.target.value })
                  }
                />
              </Field>
              <Field label="Resource type">
                <select
                  value={editing.kind}
                  onChange={(e) =>
                    setEditing({ ...editing, kind: e.target.value })
                  }
                >
                  {["Study guide", "Revision notes", "Worksheet"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea
                required
                rows={3}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </Field>
            <label className="upload-zone">
              <Upload size={22} />
              <strong>
                {busy
                  ? "Reading your file…"
                  : editing.fileName || "Choose a PDF or image"}
              </strong>
              <small>
                PDF, PNG, JPG or WebP · Up to 800 KB · Browser storage only
              </small>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={fileChange}
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) =>
                  setEditing({ ...editing, published: e.target.checked })
                }
              />
              Publish to this class
            </label>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <div className="modal-actions">
              <button className="button" disabled={busy}>
                Save resource
              </button>
            </div>
          </form>
        </Modal>
      )}
      {view && (
        <Modal
          wide
          title={view.title}
          subtitle={`${view.className} · ${view.subject} · ${view.chapter}`}
          onClose={() => setView(null)}
        >
          {view.dataUrl ? (
            view.mime?.startsWith("image/") ? (
              <img
                className="resource-preview"
                src={view.dataUrl}
                alt={view.title}
              />
            ) : (
              <object
                className="pdf-preview"
                data={view.dataUrl}
                type="application/pdf"
              >
                <p>
                  PDF preview is not supported by this browser. Use Download
                  below.
                </p>
              </object>
            )
          ) : (
            <pre className="note-preview">{view.content}</pre>
          )}
          <div className="modal-actions">
            <button className="button" onClick={() => download(view)}>
              <Download size={17} />
              Download resource
            </button>
          </div>
        </Modal>
      )}
      {remove && (
        <Confirm
          title="Remove this resource?"
          danger
          onClose={() => setRemove(null)}
          onConfirm={() => {
            update((d) => ({
              ...d,
              notes: d.notes.filter((n) => n.id !== remove.id),
            }));
            setRemove(null);
            notify("Resource removed.");
          }}
        >
          “{remove.title}” will be removed from the demo library.
        </Confirm>
      )}
    </>
  );
}
