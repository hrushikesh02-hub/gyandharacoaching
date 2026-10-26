import React, { useEffect, useRef } from "react";
import {
  BookOpen,
  ArrowUpRight,
  X,
  Search,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Link } from "react-router-dom";
export function Brand({ light = false, small = false }) {
  return (
    <Link
      className={`brand ${light ? "light" : ""} ${small ? "small" : ""}`}
      to="/"
    >
      <span className="brand-mark">
        <BookOpen size={25} />
        <i />
      </span>
      <span>
        <strong>
          Gyandhara<span className="brand-dot">.</span>
        </strong>
        <small>COACHING CLASSES</small>
      </span>
    </Link>
  );
}
export const IconButton = ({ label, children, ...props }) => (
  <button className="icon-button" aria-label={label} title={label} {...props}>
    {children}
  </button>
);
export const Badge = ({ children }) => (
  <span
    className={`badge ${String(children).toLowerCase().replaceAll(" ", "-")}`}
  >
    {children}
  </span>
);
export function Avatar({ name, size = "" }) {
  return (
    <span className={`avatar ${size} tone-${name.charCodeAt(0) % 4}`}>
      {name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export const PageHead = ({ eyebrow, title, subtitle, children }) => (
  <div className="page-head">
    <div>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    <div className="page-actions">{children}</div>
  </div>
);
export const Empty = ({
  title = "Nothing here yet",
  description = "New records will appear here.",
  children,
}) => (
  <div className="empty">
    <Inbox size={30} />
    <h3>{title}</h3>
    <p>{description}</p>
    {children}
  </div>
);
export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <label className="search-field">
      <Search size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button onClick={() => onChange("")} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </label>
  );
}
export const Field = ({ label, children, hint }) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
);
export function Modal({ title, subtitle, children, onClose, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    function key(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current.querySelectorAll(
          'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]',
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        ref={ref}
        tabIndex={-1}
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton label="Close dialog" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </header>
        {children}
      </section>
    </div>
  );
}
export function Confirm({
  title,
  children,
  onConfirm,
  onClose,
  danger = false,
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="confirm-copy">{children}</p>
      <div className="modal-actions">
        <button className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className={`button ${danger ? "danger" : ""}`}
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}
export const TextLink = ({ to, children }) => (
  <Link className="text-link" to={to}>
    {children}
    <ArrowUpRight size={16} />
  </Link>
);
export const PanelHead = ({ title, subtitle, children }) => (
  <div className="panel-head">
    <div>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {children}
  </div>
);
export const RowLink = ({ to, children }) => (
  <Link className="row-link" to={to}>
    {children}
    <ChevronRight size={17} />
  </Link>
);
export function DemoNote({ children }) {
  return (
    <div className="demo-note">
      <span className="demo-dot" />
      {children ||
        "Demo workspace · All records are simulated and saved in this browser."}
    </div>
  );
}
