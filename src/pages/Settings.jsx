import React, { useState } from "react";
import { Save, RotateCcw, ShieldCheck, HardDrive, Clock } from "lucide-react";
import { useStore } from "../data/Store";
import { PageHead, PanelHead, Field, Confirm } from "../components/UI";
import { ProfileDetails } from "./Students";
export function StudentProfile() {
  const { db, auth } = useStore();
  return (
    <>
      <PageHead
        eyebrow="A LITTLE ABOUT YOU"
        title="Your own little corner."
        subtitle="Your learning profile, classroom and contact details."
      />
      <section className="panel student-profile">
        <ProfileDetails s={db.students.find((s) => s.id === auth.id)} db={db} />
        <div className="demo-note">
          Need to update your details? Your teacher can help from the admin
          workspace.
        </div>
      </section>
    </>
  );
}
export default function Settings() {
  const { db, update, notify, reset } = useStore();
  const [values, setValues] = useState(db.settings);
  const [confirm, setConfirm] = useState(false);
  function submit(e) {
    e.preventDefault();
    if (Object.values(values).some((v) => !String(v).trim()))
      return notify("Please complete all institute fields.", "error");
    update((d) => ({ ...d, settings: values }));
    notify("Institute settings saved.");
  }
  return (
    <>
      <PageHead
        eyebrow="MAKE YOURSELF AT HOME"
        title="A workspace that feels like yours."
        subtitle="Institute details, batch information and demo controls."
      />
      <div className="settings-grid">
        <section className="panel">
          <PanelHead
            title="The institute"
            subtitle="Details for your demo workspace"
          />
          <form onSubmit={submit} className="settings-form">
            {[
              ["name", "Institute name"],
              ["email", "Contact email"],
              ["phone", "Contact phone"],
              ["address", "Address"],
              ["academicYear", "Academic year"],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  required
                  type={key === "email" ? "email" : "text"}
                  value={values[key]}
                  onChange={(e) =>
                    setValues({ ...values, [key]: e.target.value })
                  }
                />
              </Field>
            ))}
            <button className="button">
              <Save size={16} />
              Save changes
            </button>
          </form>
        </section>
        <div>
          <section className="panel">
            <PanelHead
              title="Learning, on a rhythm"
              subtitle="Your four classroom batches"
            />
            {db.batches.map((b) => (
              <div className="settings-batch" key={b.id}>
                <strong>
                  {b.name}
                  <span>{b.className}</span>
                </strong>
                <p>{b.days}</p>
                <small>
                  <Clock size={14} />
                  {b.time}
                </small>
              </div>
            ))}
          </section>
          <section className="panel demo-settings">
            <ShieldCheck size={25} />
            <h2>A safe space to explore.</h2>
            <p>
              This is a frontend demonstration. Authentication, attendance and
              payments are simulated. Records and small attachments stay in this
              browser and are not synced.
            </p>
            <p>
              Student pages filter records by the signed-in student. Browser
              storage is not a secure production authorization system.
            </p>
            <button
              className="button secondary danger-outline"
              onClick={() => setConfirm(true)}
            >
              <RotateCcw size={16} />
              Reset demo data
            </button>
          </section>
        </div>
      </div>
      {confirm && (
        <Confirm
          title="Start fresh?"
          danger
          onClose={() => setConfirm(false)}
          onConfirm={reset}
        >
          All demo changes, registrations, payments, attachments and attendance
          sessions in this browser will be replaced with the original sample
          data. You will be signed out. This cannot be undone.
        </Confirm>
      )}
    </>
  );
}
