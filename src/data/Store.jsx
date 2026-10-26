import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { createSeed } from "./seed";
const KEY = "gyandhara-demo-v1";
const AUTH = "gyandhara-session-v1";
const Context = createContext(null);
export function StoreProvider({ children }) {
  const [storageError, setStorageError] = useState("");
  const [db, setDb] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved?.version === 1 && Array.isArray(saved.students)) return saved;
    } catch {}
    return createSeed();
  });
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(AUTH) || localStorage.getItem(AUTH),
      );
    } catch {
      return null;
    }
  });
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const dbRef = useRef(db);
  dbRef.current = db;
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is full or unavailable. Changes are only in memory. Remove large attachments or allow local storage.",
      );
    }
  }, [db]);
  useEffect(() => {
    try {
      localStorage.setItem(AUTH, JSON.stringify(auth));
      sessionStorage.setItem(AUTH, JSON.stringify(auth));
    } catch {}
  }, [auth]);
  useEffect(() => {
    const sync = (e) => {
      if (e.key === KEY && e.newValue) {
        try {
          const next = JSON.parse(e.newValue);
          if (next.version === 1) {
            dbRef.current = next;
            setDb(next);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      clearTimeout(timer.current);
    };
  }, []);
  function notify(message, type = "success") {
    setToast({ message, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 5000);
  }
  function update(fn) {
    const next = fn(dbRef.current);
    dbRef.current = next;
    setDb(next);
    return next;
  }
  function login(role, email, password) {
    if (role === "admin") {
      if (
        email.toLowerCase() !== "admin@gyandhara.demo" ||
        password !== "Admin@123"
      )
        throw Error("Email or password is incorrect.");
      setAuth({ role: "admin" });
      return;
    }
    const s = db.students.find(
      (s) =>
        s.email.toLowerCase() === email.toLowerCase() &&
        s.password === password,
    );
    if (!s) throw Error("Email or password is incorrect.");
    if (s.status === "Pending")
      throw Error(
        "Your registration is awaiting approval. Please contact your teacher.",
      );
    if (s.status !== "Active")
      throw Error("Your account is not active. Please contact your teacher.");
    setAuth({ role: "student", id: s.id });
  }
  function logout() {
    setAuth(null);
  }
  function reset() {
    const next = createSeed();
    dbRef.current = next;
    setDb(next);
    setAuth(null);
    notify("Demo data has been reset.");
  }
  return (
    <Context.Provider
      value={{ db, update, auth, login, logout, notify, reset }}
    >
      {children}
      {storageError && (
        <div className="storage-warning" role="alert">
          {storageError}
        </div>
      )}
      {toast && (
        <div role="status" className={`toast ${toast.type}`}>
          {toast.type === "error" ? "!" : "✓"}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
