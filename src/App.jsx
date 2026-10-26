import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { StoreProvider } from "./data/Store";
import PortalLayout from "./layouts/PortalLayout";
import { Landing, Login, Register } from "./pages/Public";
import { AdminOverview, StudentOverview } from "./pages/Overview";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Materials from "./pages/Materials";
import Announcements from "./pages/Announcements";
import Reports from "./pages/Reports";
import Settings, { StudentProfile } from "./pages/Settings";
export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/admin/login"
            element={<Login key="admin" role="admin" />}
          />
          <Route
            path="/student/login"
            element={<Login key="student" role="student" />}
          />
          <Route path="/student/register" element={<Register />} />
          <Route path="/admin" element={<PortalLayout role="admin" />}>
            <Route index element={<AdminOverview />} />
            <Route path="students" element={<Students />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="fees" element={<Fees />} />
            <Route path="materials" element={<Materials />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/student" element={<PortalLayout role="student" />}>
            <Route index element={<StudentOverview />} />
            <Route path="attendance" element={<Attendance student />} />
            <Route path="fees" element={<Fees student />} />
            <Route path="materials" element={<Materials student />} />
            <Route path="announcements" element={<Announcements student />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="not-found">
                <p className="eyebrow">A LITTLE DETOUR</p>
                <h1>This page isn’t in the notebook.</h1>
                <p>Let’s find your way back.</p>
                <Link className="button" to="/">
                  Back to Gyandhara
                </Link>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
