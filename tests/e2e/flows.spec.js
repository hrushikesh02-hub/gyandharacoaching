import { test, expect } from "@playwright/test";
async function admin(page) {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "Enter workspace" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
async function student(
  page,
  email = "aarav@gyandhara.demo",
  password = "Student@123",
) {
  await page.goto("/student/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Let’s get learning" }).click();
  await page.waitForFunction(
    () =>
      location.pathname === "/student" ||
      !!document.querySelector('[role="alert"]'),
  );
}
async function data(page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("gyandhara-demo-v1")),
  );
}
test("registration stays pending, approval unlocks student login, and profile persists", async ({
  page,
}) => {
  await page.goto("/student/register");
  await page.getByLabel("Full name").fill("Neha Kulkarni");
  await page.getByLabel("Email address").fill("neha@example.demo");
  await page.getByLabel("Mobile number", { exact: true }).fill("9898989898");
  await page.getByLabel("Demo password").fill("NehaDemo123");
  await page.getByLabel("School", { exact: true }).fill("Demo Public School");
  await page.getByLabel("Parent / guardian name").fill("Anil Kulkarni");
  await page.getByLabel("Parent mobile number").fill("9878987898");
  await page.getByLabel("Residential address").fill("15, Kothrud, Pune");
  await page.getByRole("button", { name: "Submit registration" }).click();
  await expect(
    page.getByText("pending approval", { exact: true }),
  ).toBeVisible();
  await student(page, "neha@example.demo", "NehaDemo123");
  await expect(page.getByRole("alert")).toContainText("awaiting approval");
  await admin(page);
  await page.goto("/admin/students");
  await page
    .getByPlaceholder("Search name, email or mobile…")
    .fill("Neha Kulkarni");
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await student(page, "neha@example.demo", "NehaDemo123");
  await expect(page).toHaveURL(/\/student$/);
  await expect(
    page.getByRole("heading", { name: /Hello, Neha/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Hello, Neha/ }),
  ).toBeVisible();
  await page.goto("/admin/students");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
test("QR session, duplicate protection, expiry and attendance persistence", async ({
  page,
}) => {
  await admin(page);
  await page.goto("/admin/attendance");
  await page.getByRole("button", { name: "Start attendance session" }).click();
  const code = await page.locator(".session-code").textContent();
  await expect(page.locator(".session-card img")).toBeVisible();
  await student(page, "aarav@gyandhara.demo");
  await expect(page).toHaveURL(/\/student$/);
  await page.goto("/student/attendance");
  await page.getByLabel("Session code").fill(code);
  await page.getByRole("button", { name: "Check in to class" }).click();
  const db = await data(page);
  const s = db.students.find((s) => s.email === "aarav@gyandhara.demo");
  const date = db.sessions[0].date;
  expect(
    db.attendance.filter(
      (a) => a.studentId === s.id && a.date === date && a.present,
    ),
  ).toHaveLength(1);
  await page.getByLabel("Session code").fill(code);
  await page.getByRole("button", { name: "Check in to class" }).click();
  await expect(page.getByRole("alert")).toContainText("already checked in");
  await admin(page);
  await page.goto("/admin/attendance");
  await page.getByRole("button", { name: "End session" }).click();
  await student(page, "aarav@gyandhara.demo");
  await page.goto("/student/attendance");
  await page.getByLabel("Session code").fill(code);
  await page.getByRole("button", { name: "Check in to class" }).click();
  await expect(page.getByRole("alert")).toContainText("expired");
});
test("failed payment leaves ledger unchanged; success creates receipt and balances survive reload", async ({
  page,
}) => {
  await student(page, "ananya@gyandhara.demo");
  await expect(page).toHaveURL(/\/student$/);
  await page.goto("/student/fees");
  const before = await data(page);
  await page.getByRole("button", { name: "Pay now" }).click();
  await page.getByLabel("Amount (₹)").fill("1000");
  await page.getByLabel("Demo outcome").selectOption("failure");
  await page
    .getByRole("button", { name: "Simulate payment", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Simulated payment failed",
  );
  expect((await data(page)).payments).toEqual(before.payments);
  await page.getByLabel("Demo outcome").selectOption("success");
  await page
    .getByRole("button", { name: "Simulate payment", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "A contribution, recorded." }),
  ).toBeVisible();
  const after = await data(page);
  expect(after.payments.length).toBe(before.payments.length + 1);
  expect(after.payments[0].amount).toBe(1000);
  expect(after.payments[0].studentId).toBe("s2");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download receipt" }).click();
  expect((await download).suggestedFilename()).toMatch(/^GY-/);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.reload();
  expect((await data(page)).payments).toEqual(after.payments);
  await expect(page.getByText("Aarav Sharma", { exact: true })).toHaveCount(0);
});
test("materials publish to the target class and uploads can be viewed and downloaded", async ({
  page,
}) => {
  await admin(page);
  await page.goto("/admin/materials");
  await page.getByRole("button", { name: "Add study material" }).click();
  await page.getByLabel("Resource title").fill("Test algebra poster");
  await page.getByLabel("Chapter", { exact: true }).fill("Chapter 3");
  await page
    .getByLabel("Description")
    .fill("A test revision poster for Class 8.");
  await page.locator("input[type=file]").setInputFiles({
    name: "algebra.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3foAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByRole("button", { name: "Save resource" }).click();
  await expect(
    page.getByRole("heading", { name: "Test algebra poster" }),
  ).toBeVisible();
  await student(page);
  await page.goto("/student/materials");
  await expect(
    page.getByRole("heading", { name: "Test algebra poster" }),
  ).toBeVisible();
  const card = page.locator("article").filter({
    has: page.getByRole("heading", { name: "Test algebra poster" }),
  });
  await card.getByRole("button", { name: "View resource" }).click();
  await expect(page.locator(".resource-preview")).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download resource", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("algebra.png");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await student(page, "ananya@gyandhara.demo");
  await page.goto("/student/materials");
  await expect(
    page.getByRole("heading", { name: "Test algebra poster" }),
  ).toHaveCount(0);
  await admin(page);
  await page.goto("/admin/materials");
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "Test algebra poster" }) })
    .getByRole("button", { name: "Unpublish", exact: true })
    .click();
  await student(page);
  await page.goto("/student/materials");
  await expect(
    page.getByRole("heading", { name: "Test algebra poster" }),
  ).toHaveCount(0);
});
test("admin navigation, reports, announcement targeting and reset confirmation", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await admin(page);
  for (const path of [
    "students",
    "attendance",
    "fees",
    "materials",
    "announcements",
    "reports",
    "settings",
  ]) {
    await page.goto(`/admin/${path}`);
    await expect(page.locator("main h1")).toBeVisible();
  }
  await page.goto("/admin/announcements");
  await page.getByRole("button", { name: "New announcement" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Class 10 reminder");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Bring a geometry kit.");
  await page.getByLabel("Audience").selectOption("Class 10");
  await page.getByRole("button", { name: "Save announcement" }).click();
  await student(page);
  await page.goto("/student/announcements");
  await expect(
    page.getByRole("heading", { name: "Class 10 reminder" }),
  ).toHaveCount(0);
  await admin(page);
  await page.goto("/admin/reports");
  for (const tab of ["Enrollment", "Attendance", "Fees", "Exam results"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    expect((await download).suggestedFilename()).toContain("gyandhara");
  }
  await page.goto("/admin/settings");
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(
    (await data(page)).announcements.some(
      (a) => a.title === "Class 10 reminder",
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(
    (await data(page)).announcements.some(
      (a) => a.title === "Class 10 reminder",
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});
test("admin edits, fee configuration, assessment entry and student deactivation", async ({
  page,
}) => {
  await admin(page);
  await page.goto("/admin/students");
  await page
    .getByPlaceholder("Search name, email or mobile…")
    .fill("Aarav Sharma");
  await page.getByRole("button", { name: "Edit Aarav Sharma" }).click();
  await page.getByLabel("School", { exact: true }).fill("Updated Demo School");
  await page.getByRole("button", { name: "Save student" }).click();
  await page.getByRole("button", { name: /Aarav Sharma aarav/ }).click();
  await expect(
    page.getByText("Updated Demo School", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.goto("/admin/fees");
  await page
    .getByRole("button", { name: "Configure fees for Aarav Sharma" })
    .click();
  await page.getByLabel("Total applicable fees (₹)").fill("20000");
  await page.getByRole("button", { name: "Save fee structure" }).click();
  expect((await data(page)).students.find((s) => s.id === "s1").fees).toBe(
    20000,
  );
  await page.goto("/admin/reports");
  await page.getByRole("button", { name: "Exam results", exact: true }).click();
  await page.getByRole("button", { name: "Add result" }).click();
  await page.getByLabel("Assessment title").fill("Algebra checkpoint");
  await page.getByLabel("Marks scored").fill("43");
  await page.getByLabel("Maximum marks").fill("50");
  await page.getByRole("button", { name: "Save result" }).click();
  await student(page);
  await expect(page.getByText("43 / 50", { exact: true })).toBeVisible();
  await admin(page);
  await page.goto("/admin/students");
  await page
    .getByPlaceholder("Search name, email or mobile…")
    .fill("Aarav Sharma");
  await page.getByRole("button", { name: "Deactivate", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await student(page);
  await expect(page.getByRole("alert")).toContainText("not active");
});
test("capture representative desktop and mobile layouts", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "qa/landing-desktop.png", fullPage: true });
  await admin(page);
  await page.screenshot({ path: "qa/admin-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "qa/admin-mobile.png", fullPage: true });
  await student(page);
  await expect(page.getByRole('heading', {name:/Hello, Aarav/})).toBeVisible();
  await page.screenshot({ path: "qa/student-mobile.png", fullPage: true });
});
test("all requested widths avoid horizontal overflow and mobile navigation works", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await admin(page);
    for (const path of [
      "",
      "students",
      "attendance",
      "fees",
      "materials",
      "announcements",
      "reports",
      "settings",
    ]) {
      await page.goto("/admin" + (path ? "/" + path : ""));
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px /admin/${path}`,
      ).toBe(true);
    }
    if (width < 1024) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(page.locator(".sidebar")).toHaveClass(/open/);
      await page.getByRole("link", { name: "Overview", exact: true }).click();
      await expect(page).toHaveURL(/\/admin$/);
    }
    await student(page);
    for (const path of [
      "",
      "attendance",
      "fees",
      "materials",
      "announcements",
      "profile",
    ]) {
      await page.goto("/student" + (path ? "/" + path : ""));
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px /student/${path}`,
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
