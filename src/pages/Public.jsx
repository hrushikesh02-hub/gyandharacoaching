import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Check,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Mail,
  Phone,
  Menu,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Brand, Field, DemoNote } from "../components/UI";
import { useStore } from "../data/Store";
import { CLASSES, SUBJECTS } from "../data/seed";
import { uid, today } from "../utils/domain";
export function Landing() {
  const [menu, setMenu] = useState(false);
  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand />
        <nav className={menu ? "open" : ""}>
          <a href="#approach" onClick={() => setMenu(false)}>
            Our approach
          </a>
          <a href="#programmes" onClick={() => setMenu(false)}>
            Programmes
          </a>
          <a href="#contact" onClick={() => setMenu(false)}>
            Get in touch
          </a>
          <Link to="/admin/login" className="admin-link">
            Admin login
            <ArrowUpRight size={14} />
          </Link>
          <Link className="button" to="/student/login">
            Student portal <ArrowUpRight size={16} />
          </Link>
        </nav>
        <button
          className="mobile-menu icon-button"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle menu"
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> A LITTLE GUIDANCE. A WORLD OF POSSIBILITY.
          </div>
          <h1>
            Learning Today.
            <br />
            <em>Building</em>
            <br />
            Tomorrow<span>.</span>
          </h1>
          <p>
            Big dreams begin with small moments of understanding. A thoughtful
            space to learn, ask questions, and grow — one lesson at a time.
          </p>
          <div className="hero-buttons">
            <Link className="button" to="/student/register">
              Begin your learning journey <ArrowUpRight size={18} />
            </Link>
            <a className="text-link" href="#approach">
              Discover Gyandhara <ArrowRight size={17} />
            </a>
          </div>
          <div className="hero-footnote">
            <span className="mini-seal">
              <GraduationCap size={19} />
            </span>
            <div>
              Strong foundations. Confident futures.
              <small>School tuition for Classes 8–11</small>
            </div>
          </div>
        </div>
        <div className="hero-art" aria-label="Illustrated learning notebook">
          <div className="art-top">
            <span>THE GYANDHARA NOTEBOOK</span>
            <span>01 / GROWTH</span>
          </div>
          <div className="orbital orbital-one" />
          <div className="orbital orbital-two" />
          <span className="art-star star-one">✳</span>
          <span className="art-star star-two">✧</span>
          <div className="book-illustration">
            <div className="book-page left-page">
              <small>A SPACE TO</small>
              <strong>
                learn.
                <br />
                wonder.
                <br />
                <em>become.</em>
              </strong>
              <div className="ink-line" />
              <div className="ink-line short" />
            </div>
            <div className="book-page right-page">
              <div className="sun-drawing">
                <span />
              </div>
              <span className="plant-stem" />
              <span className="leaf leaf-1" />
              <span className="leaf leaf-2" />
              <span className="leaf leaf-3" />
              <span className="leaf leaf-4" />
              <small>GROW AT YOUR OWN PACE.</small>
            </div>
          </div>
          <div className="art-bottom">
            <span>
              Rooted in learning.
              <br />
              Growing with you.
            </span>
            <span className="handwritten">ज्ञान से विकास</span>
          </div>
          <div className="art-tag">
            <span className="tag-icon">
              <Check size={20} />
            </span>
            <div>
              More than better marks.<strong>A better understanding.</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="subject-strip">
        <span>A STRONGER START IN</span>
        <b>Mathematics</b>
        <i>✦</i>
        <b>Science</b>
        <i>✦</i>
        <b>English</b>
        <i>✦</i>
        <b>Social Science</b>
      </section>
      <section className="approach section" id="approach">
        <div>
          <div className="eyebrow">THE WAY WE LEARN</div>
          <h2>
            Every student is different.
            <br />
            <em>The care stays the same.</em>
          </h2>
          <p>
            At Gyandhara, we believe understanding comes before memorising. Our
            learning approach brings patient guidance, consistent practice, and
            thoughtful feedback together.
          </p>
        </div>
        <div className="approach-items">
          {[
            [
              BookOpen,
              "Clarity before complexity",
              "Build strong concepts with explanations that make sense, and questions that are always welcome.",
            ],
            [
              HeartHandshake,
              "Guidance that feels personal",
              "A supportive space where each learner can find their rhythm and build confidence.",
            ],
            [
              Sparkles,
              "Small steps. Steady progress.",
              "Regular practice, assessments and honest conversations make growth visible.",
            ],
          ].map(([Icon, title, text], i) => (
            <article key={title}>
              <span className="approach-number">0{i + 1}</span>
              <div>
                <Icon size={23} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="programmes section" id="programmes">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ROOM TO GROW</div>
            <h2>
              The right support.
              <br />
              <em>At the right stage.</em>
            </h2>
          </div>
          <p>
            Four thoughtfully structured batches.
            <br />
            One shared commitment to learning.
          </p>
        </div>
        <div className="programme-grid">
          {[
            ["08", "Foundation", "Make the fundamentals feel familiar."],
            ["09", "Achievers", "Connect concepts. Build momentum."],
            ["10", "Board Champions", "Prepare with purpose and confidence."],
            ["11", "Excel", "A thoughtful start to your next chapter."],
          ].map(([n, title, desc]) => (
            <Link key={n} to="/student/register">
              <span>CLASS {n}</span>
              <div className="programme-number">{n}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <ArrowUpRight size={24} />
            </Link>
          ))}
        </div>
      </section>
      <section className="contact-section section" id="contact">
        <div>
          <div className="eyebrow">LET’S BEGIN</div>
          <h2>
            A brighter tomorrow
            <br />
            starts with <em>a conversation.</em>
          </h2>
          <p>
            Explore the student portal or register to experience the Gyandhara
            demo.
          </p>
          <Link className="button saffron" to="/student/register">
            Find your place at Gyandhara <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="contact-details">
          <span>
            <MapPin />
            Kothrud, Pune, Maharashtra
          </span>
          <a href="mailto:hello@gyandhara.demo">
            <Mail />
            hello@gyandhara.demo
          </a>
          <span>
            <Phone />
            +91 98765 43210
          </span>
          <small>Illustrative contact details for this frontend demo.</small>
        </div>
      </section>
      <footer className="landing-footer">
        <Brand small />
        <span>Learning, thoughtfully connected.</span>
        <DemoNote>Frontend demo · No real payments or authentication</DemoNote>
      </footer>
    </div>
  );
}
export function Login({ role }) {
  const { login } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const admin = role === "admin";
  const [email, setEmail] = useState(
    admin ? "admin@gyandhara.demo" : "aarav@gyandhara.demo",
  );
  const [password, setPassword] = useState(admin ? "Admin@123" : "Student@123");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    await new Promise((r) => setTimeout(r, 250));
    try {
      login(role, email.trim(), password);
      navigate(`/${role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Brand light />
        <div>
          <div className="eyebrow">
            {admin
              ? "A LITTLE ORGANISATION. MORE POSSIBILITY."
              : "YOUR NEXT CHAPTER STARTS HERE."}
          </div>
          <h1>
            {admin ? (
              <>
                More time
                <br />
                for what
                <br />
                <em>matters.</em>
              </>
            ) : (
              <>
                A little progress.
                <br />
                Every
                <br />
                <em>single day.</em>
              </>
            )}
          </h1>
          <p>
            {admin
              ? "A thoughtfully connected workspace for your students, your classroom, and everything in between."
              : "Your lessons, your milestones, your growing confidence. All in one place."}
          </p>
        </div>
        <small>GYANDHARA COACHING CLASSES · DEMO</small>
      </aside>
      <main className="auth-main">
        <Link to="/" className="back-link">
          ← Back to Gyandhara
        </Link>
        <div className="auth-form">
          <span className="auth-icon">
            {admin ? <ShieldCheck size={28} /> : <GraduationCap size={28} />}
          </span>
          <div className="eyebrow">
            {admin ? "EDUCATOR WORKSPACE" : "STUDENT PORTAL"}
          </div>
          <h2>
            Welcome back<span>.</span>
          </h2>
          <p>
            {admin
              ? "A good day of teaching starts here."
              : "Ready to pick up where you left off?"}
          </p>
          <form onSubmit={submit}>
            <Field label="Email address">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </Field>
            <Field label="Password">
              <div className="password-field">
                <input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <button disabled={busy} className="button full">
              {busy
                ? "Opening your workspace…"
                : admin
                  ? "Enter workspace"
                  : "Let’s get learning"}
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="demo-credentials">
            <strong>Take a look around</strong>
            <p>
              Demo credentials are filled in for you. Authentication is
              simulated in your browser.
            </p>
            <code>
              {admin
                ? "admin@gyandhara.demo · Admin@123"
                : "aarav@gyandhara.demo · Student@123"}
            </code>
          </div>
          {!admin && (
            <p className="auth-switch">
              New to Gyandhara?{" "}
              <Link to="/student/register">Register as a student</Link>
            </p>
          )}
          <p className="auth-switch">
            <Link to={admin ? "/student/login" : "/admin/login"}>
              {admin
                ? "Looking for the student portal?"
                : "Are you an educator? Admin login"}
              <ArrowUpRight size={14} />
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
export function StudentForm({
  initial = {},
  onSave,
  onCancel,
  admin = false,
  batches,
}) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    school: "",
    className: "Class 8",
    subjects: ["Mathematics", "Science"],
    parentName: "",
    parentMobile: "",
    address: "",
    batch: "b8",
    fees: 18000,
    dueDate: today(),
    ...initial,
  });
  const [error, setError] = useState("");
  function field(name) {
    return {
      value: values[name],
      onChange: (e) => setValues({ ...values, [name]: e.target.value }),
    };
  }
  function submit(e) {
    e.preventDefault();
    setError("");
    if (!values.subjects.length)
      return setError("Choose at least one subject.");
    if (
      !values.name.trim() ||
      !values.parentName.trim() ||
      !values.school.trim()
    )
      return setError("Name, school and parent name cannot be blank.");
    try {
      onSave({
        ...values,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        fees: Number(values.fees),
      });
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <form onSubmit={submit} className="student-form">
      <div className="form-section-label">01 / STUDENT DETAILS</div>
      <div className="form-grid">
        <Field label="Full name">
          <input required {...field("name")} />
        </Field>
        <Field label="Email address">
          <input type="email" required {...field("email")} />
        </Field>
        <Field label="Mobile number">
          <input
            required
            pattern="[6-9][0-9]{9}"
            title="Enter a valid 10-digit Indian mobile number"
            maxLength={10}
            inputMode="numeric"
            {...field("mobile")}
          />
        </Field>
        <Field
          label="Demo password"
          hint="At least 8 characters. Do not reuse a real password."
        >
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            {...field("password")}
          />
        </Field>
        <Field label="School">
          <input required {...field("school")} />
        </Field>
        <Field label="Class">
          <select
            {...field("className")}
            onChange={(e) =>
              setValues({
                ...values,
                className: e.target.value,
                batch:
                  batches.find((b) => b.className === e.target.value)?.id || "",
              })
            }
          >
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset className="subject-options">
        <legend>Subjects</legend>
        {SUBJECTS.map((s) => (
          <label key={s}>
            <input
              type="checkbox"
              checked={values.subjects.includes(s)}
              onChange={(e) =>
                setValues({
                  ...values,
                  subjects: e.target.checked
                    ? [...values.subjects, s]
                    : values.subjects.filter((x) => x !== s),
                })
              }
            />
            {s}
          </label>
        ))}
      </fieldset>
      <div className="form-section-label">02 / PARENT & CONTACT DETAILS</div>
      <div className="form-grid">
        <Field label="Parent / guardian name">
          <input required {...field("parentName")} />
        </Field>
        <Field label="Parent mobile number">
          <input
            required
            pattern="[6-9][0-9]{9}"
            title="Enter a valid 10-digit Indian mobile number"
            maxLength={10}
            inputMode="numeric"
            {...field("parentMobile")}
          />
        </Field>
      </div>
      <Field label="Residential address">
        <textarea required rows={2} {...field("address")} />
      </Field>
      {admin && (
        <>
          <div className="form-section-label">03 / ENROLLMENT & FEES</div>
          <div className="form-grid">
            <Field label="Batch">
              <select {...field("batch")}>
                {batches
                  .filter((b) => b.className === values.className)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Total applicable fees (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                {...field("fees")}
              />
            </Field>
            <Field label="Fee due date">
              <input type="date" required {...field("dueDate")} />
            </Field>
          </div>
        </>
      )}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <div className="modal-actions">
        {onCancel && (
          <button type="button" className="button secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="button">
          {admin ? "Save student" : "Submit registration"}
          <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}
export function Register() {
  const { db, update, notify } = useStore();
  const [done, setDone] = useState(false);
  function save(values) {
    if (db.students.some((s) => s.email.toLowerCase() === values.email))
      throw Error("This email is already registered. Try signing in.");
    const batch = db.batches.find((b) => b.className === values.className);
    update((d) => ({
      ...d,
      students: [
        ...d.students,
        {
          ...values,
          id: uid(),
          status: "Pending",
          batch: batch.id,
          fees: 18000 + CLASSES.indexOf(values.className) * 3000,
          dueDate: today(),
          joined: today(),
        },
      ],
    }));
    setDone(true);
    notify("Registration received. Your teacher will review it.");
  }
  return (
    <div className="register-page">
      <header>
        <Brand />
        <Link to="/student/login" className="text-link">
          Already registered? Sign in <ArrowUpRight size={16} />
        </Link>
      </header>
      <main>
        {done ? (
          <div className="registration-success">
            <span>
              <Check size={35} />
            </span>
            <div className="eyebrow">YOUR JOURNEY HAS BEGUN</div>
            <h1>
              A warm welcome
              <br />
              is on its way.
            </h1>
            <p>
              Your registration is <strong>pending approval</strong>. Your
              teacher will review your details before you can enter the student
              portal.
            </p>
            <Link to="/student/login" className="button">
              Back to student login <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            <div className="eyebrow">LET’S GET TO KNOW YOU</div>
            <h1>
              Every journey starts
              <br />
              with a <em>first step.</em>
            </h1>
            <p className="register-intro">
              Create your student profile. Your teacher will approve your
              registration.
              <br />
              Demo only — use fictional details and a demo password.
            </p>
            <div className="panel registration-panel">
              <StudentForm onSave={save} batches={db.batches} />
            </div>
          </>
        )}
      </main>
      <DemoNote />
    </div>
  );
}
