import { localDate, today } from "../utils/domain.js";
export const SUBJECTS = ["Mathematics", "Science", "English", "Social Science"];
export const CLASSES = ["Class 8", "Class 9", "Class 10", "Class 11"];
export function createSeed() {
  const date = today();
  const now = new Date();
  const relative = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return localDate(d);
  };
  const batches = [
    {
      id: "b8",
      name: "Foundation",
      className: "Class 8",
      time: "4:00 – 5:00 PM",
      days: "Mon · Wed · Fri",
    },
    {
      id: "b9",
      name: "Achievers",
      className: "Class 9",
      time: "5:00 – 6:00 PM",
      days: "Mon · Wed · Fri",
    },
    {
      id: "b10",
      name: "Board Champions",
      className: "Class 10",
      time: "6:00 – 7:30 PM",
      days: "Mon · Tue · Thu · Sat",
    },
    {
      id: "b11",
      name: "Excel",
      className: "Class 11",
      time: "7:30 – 8:30 PM",
      days: "Tue · Thu · Sat",
    },
  ];
  const names = [
    "Aarav Sharma",
    "Ananya Patel",
    "Vivaan Shah",
    "Diya Deshmukh",
    "Arjun Mehta",
    "Ishita Joshi",
    "Aditya Kulkarni",
    "Saanvi Gupta",
    "Reyansh Singh",
    "Avni Nair",
    "Krish Verma",
    "Myra Iyer",
    "Atharv Patil",
    "Kiara Jain",
    "Vedant Rao",
    "Sara Khan",
    "Rohan Malhotra",
    "Tara Chavan",
    "Kabir Sethi",
    "Aisha Fernandes",
  ];
  const students = names.map((name, i) => ({
    id: `s${i + 1}`,
    name,
    email: `${name.split(" ")[0].toLowerCase()}@gyandhara.demo`,
    mobile: `98765${String(43000 + i).padStart(5, "0")}`,
    password: "Student@123",
    school: [
      "Vidya Valley School",
      "Delhi Public School",
      "Orchid International School",
      "DAV Public School",
    ][i % 4],
    className: CLASSES[i % 4],
    subjects: SUBJECTS.slice(0, i % 2 ? 3 : 2),
    parentName: `${["Rajesh", "Sunita", "Amit", "Priya"][i % 4]} ${name.split(" ")[1]}`,
    parentMobile: `98766${String(43000 + i).padStart(5, "0")}`,
    address: `${12 + i}, ${["Kothrud", "Baner", "Aundh", "Wakad"][i % 4]}, Pune`,
    batch: batches[i % 4].id,
    status: i >= 16 && i <= 18 ? "Pending" : i === 19 ? "Inactive" : "Active",
    fees: 18000 + (i % 4) * 3000,
    dueDate: relative(i % 3 === 0 ? -5 : 10),
    joined: relative(-90 + i),
  }));
  const payments = students
    .slice(0, 16)
    .flatMap((s, i) =>
      Array.from({ length: i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 2 }, (_, j) => {
        const d = new Date(
          now.getFullYear(),
          now.getMonth() - 2 + j,
          Math.min(5 + i, 25),
        );
        return {
          id: `p${i}-${j}`,
          studentId: s.id,
          amount: s.fees / 3,
          method: ["UPI", "Cash", "Bank transfer"][(i + j) % 3],
          date: localDate(d),
          receipt: `GY-2026-${1001 + i * 3 + j}`,
        };
      }),
    )
    .filter((p) => p.date <= date)
    .sort((a, b) => b.date.localeCompare(a.date));
  const attendance = [];
  for (let day = 14; day >= 0; day--) {
    const d = new Date(now);
    d.setDate(d.getDate() - day);
    if (d.getDay() === 0) continue;
    students
      .slice(0, 16)
      .forEach((s, i) =>
        attendance.push({
          id: `a${day}-${i}`,
          studentId: s.id,
          date: localDate(d),
          present: (i + day) % 9 !== 0,
        }),
      );
  }
  return {
    version: 1,
    students,
    batches,
    payments,
    attendance,
    sessions: [],
    notes: [
      {
        id: "n1",
        title: "Quadratic equations, made simple",
        className: "Class 10",
        subject: "Mathematics",
        chapter: "Chapter 4",
        description:
          "A guided revision sheet with worked examples, key formulas and practice questions.",
        published: true,
        date: relative(-2),
        fileName: "quadratic-equations.txt",
        kind: "Study guide",
        content:
          "GYANDHARA • MATHEMATICS\nQuadratic equations\n\nStandard form: ax² + bx + c = 0.\nDiscriminant: D = b² − 4ac.\nRoots: x = (−b ± √D) / 2a.\n\nWorked example: x² − 5x + 6 = 0\nFactor: (x − 2)(x − 3) = 0, so x = 2 or 3.\n\nPractice: Solve x² − 7x + 12 = 0.\nDemo educational resource.",
      },
      {
        id: "n2",
        title: "The science of light",
        className: "Class 9",
        subject: "Science",
        chapter: "Chapter 8",
        description:
          "Reflection, refraction and ray diagrams — your essential revision companion.",
        published: true,
        date: relative(-4),
        fileName: "light-revision.txt",
        kind: "Revision notes",
        content:
          "GYANDHARA • SCIENCE\nLight revision\n\nAngle of incidence equals angle of reflection.\nA convex lens converges parallel rays.\nDraw and label a ray diagram for an object beyond 2F.\n\nDemo educational resource.",
      },
      {
        id: "n3",
        title: "Building a strong foundation in algebra",
        className: "Class 8",
        subject: "Mathematics",
        chapter: "Chapter 3",
        description:
          "Expressions, identities and a little practice to build confidence.",
        published: true,
        date: relative(-5),
        fileName: "algebra-practice.txt",
        kind: "Worksheet",
        content:
          "GYANDHARA • ALGEBRA\n\n(a + b)² = a² + 2ab + b²\n(a − b)² = a² − 2ab + b²\n\nPractice: Expand (x + 4)².\nSimplify 3x + 5x − 2.\n\nDemo educational resource.",
      },
      {
        id: "n4",
        title: "Understanding motion",
        className: "Class 11",
        subject: "Science",
        chapter: "Chapter 2",
        description:
          "An introduction to velocity, acceleration and equations of motion.",
        published: false,
        date: relative(-1),
        fileName: "motion.txt",
        kind: "Study guide",
        content:
          "GYANDHARA • MOTION\n\nv = u + at\ns = ut + ½at²\nv² = u² + 2as\n\nThese equations assume constant acceleration.\nDemo educational resource.",
      },
    ],
    announcements: [
      {
        id: "an1",
        title: "A little preparation goes a long way",
        body: "The monthly Mathematics assessment is coming up. Revise the chapters covered in class and bring your geometry kit.",
        className: "All classes",
        type: "Test",
        eventDate: relative(3),
        published: true,
        date: relative(-1),
      },
      {
        id: "an2",
        title: "Let’s talk about your progress",
        body: "Parents are invited for a one-to-one progress discussion this Saturday. Please contact your teacher to choose a time.",
        className: "All classes",
        type: "Notice",
        eventDate: relative(5),
        published: true,
        date: relative(-2),
      },
      {
        id: "an3",
        title: "Extra practice. Extra confidence.",
        body: "A special board exam doubt-solving session will be held at 5 PM. Bring the questions you would like to work through.",
        className: "Class 10",
        type: "Class update",
        eventDate: relative(2),
        published: true,
        date: relative(-3),
      },
    ],
    results: students
      .slice(0, 16)
      .flatMap((s, i) =>
        ["Mathematics", "Science", "English"].map((subject, j) => ({
          id: `r${i}-${j}`,
          studentId: s.id,
          subject,
          title: "Monthly assessment",
          score: 65 + ((i * 7 + j * 9) % 34),
          total: 100,
          date: relative(-7),
        })),
      ),
    settings: {
      name: "Gyandhara Coaching Classes",
      email: "hello@gyandhara.demo",
      phone: "+91 98765 43210",
      address: "Kothrud, Pune, Maharashtra",
      academicYear: "2026–27",
    },
  };
}
