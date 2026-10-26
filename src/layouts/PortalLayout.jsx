import React, { useState } from "react";
import { NavLink, Outlet, useLocation, Link, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ScanLine,
  Wallet,
  BookOpen,
  Megaphone,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ArrowUpRight,
  ChevronDown,
  GraduationCap,
  UserRound,
} from "lucide-react";
import { Brand, Avatar, IconButton, DemoNote } from "../components/UI";
import { useStore } from "../data/Store";
const adminNav = [
  ["", "Overview", LayoutDashboard],
  ["students", "Students", Users],
  ["attendance", "Attendance", ScanLine],
  ["fees", "Fees & payments", Wallet],
  ["materials", "Study materials", BookOpen],
  ["announcements", "Announcements", Megaphone],
  ["reports", "Reports", ChartNoAxesCombined],
  ["settings", "Settings", Settings],
];
const studentNav = [
  ["", "My overview", LayoutDashboard],
  ["attendance", "My attendance", ScanLine],
  ["fees", "My fees", Wallet],
  ["materials", "Study materials", BookOpen],
  ["announcements", "Notice board", Megaphone],
  ["profile", "My profile", UserRound],
];
export default function PortalLayout({ role }) {
  const { auth, db, logout } = useStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const student = db.students.find((s) => s.id === auth?.id);
  const admin = role === "admin";
  if (auth?.role !== role || (!admin && student?.status !== "Active"))
    return <Navigate to={`/${role}/login`} replace />;
  const nav = admin ? adminNav : studentNav;
  const active =
    nav.find(
      ([path]) => location.pathname === `/${role}${path ? "/" + path : ""}`,
    )?.[1] || "Overview";
  return (
    <div className="app-shell">
      {open && (
        <button
          className="sidebar-shade"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Brand small />
          <IconButton label="Close menu" onClick={() => setOpen(false)}>
            <X size={20} />
          </IconButton>
        </div>
        <div className="workspace-label">
          {admin ? "INSTITUTE WORKSPACE" : "YOUR LEARNING SPACE"}
        </div>
        <nav>
          {nav.map(([path, label, Icon]) => (
            <NavLink
              end
              to={`/${role}${path ? "/" + path : ""}`}
              key={label}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {path === "students" &&
                db.students.some((s) => s.status === "Pending") && (
                  <b>
                    {db.students.filter((s) => s.status === "Pending").length}
                  </b>
                )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="thought">
            <span className="tiny-star">✧</span>
            <p>
              A little progress.
              <br />
              Every single day.
            </p>
            <small>THAT’S THE GYANDHARA WAY.</small>
          </div>
          <Link to="/" className="website-link">
            Visit our website <ArrowUpRight size={16} />
          </Link>
          <button className="logout" onClick={logout}>
            <LogOut size={17} />
            Log out
          </button>
        </div>
        <div className="sidebar-person">
          <Avatar name={admin ? "Meera Deshmukh" : student.name} />
          <div>
            <strong>{admin ? "Meera Deshmukh" : student.name}</strong>
            <small>{admin ? "Owner & educator" : student.className}</small>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <IconButton label="Open menu" onClick={() => setOpen(true)}>
              <Menu size={22} />
            </IconButton>
            <span>{admin ? "Workspace" : "Student portal"}</span>
            <span className="slash">/</span>
            <strong>{active}</strong>
          </div>
          <div className="topbar-right">
            <span className="year-pill">
              <span /> Academic year {db.settings.academicYear}
            </span>
            <Link
              to={`/${role}/announcements`}
              className="bell"
              aria-label="View announcements"
            >
              <Bell size={19} />
              <i />
            </Link>
            <Avatar
              size="small"
              name={admin ? "Meera Deshmukh" : student.name}
            />
          </div>
        </header>
        <main key={location.pathname} className="workspace-main">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>
            Thoughtfully connected. <strong>Gyandhara.</strong>
          </span>
          <DemoNote />
        </footer>
      </div>
      {!admin && (
        <nav className="bottom-nav">
          {studentNav.slice(0, 4).map(([path, label, Icon]) => (
            <NavLink end key={path} to={`/student${path ? "/" + path : ""}`}>
              <Icon size={20} />
              <span>{label.replace("My ", "")}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
