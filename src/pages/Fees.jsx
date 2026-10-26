import React, { useState } from "react";
import {
  Wallet,
  Plus,
  Download,
  ReceiptText,
  Settings2,
  IndianRupee,
  Clock,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useStore } from "../data/Store";
import {
  PageHead,
  PanelHead,
  SearchInput,
  Modal,
  Field,
  Badge,
  Avatar,
  Empty,
  DemoNote,
} from "../components/UI";
import {
  money,
  paidFor,
  balanceFor,
  feeStatus,
  recordPayment,
  displayDate,
  exportCsv,
} from "../utils/domain";
import { Metric, CollectionChart } from "./Overview";
import Receipt from "../components/Receipt";
export default function Fees({ student = false }) {
  const { db, auth, update, notify } = useStore();
  const own = db.students.find((s) => s.id === auth?.id);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [pay, setPay] = useState(null);
  const [config, setConfig] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const all = student ? [own] : db.students;
  const collected = all.reduce((sum, s) => sum + paidFor(db, s.id), 0);
  const outstanding = all.reduce((sum, s) => sum + balanceFor(db, s), 0);
  const filtered = all.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) &&
      (status === "All statuses" || feeStatus(db, s) === status),
  );
  const payments = db.payments
    .filter((p) => !student || p.studentId === own.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  function openPay(s) {
    setError("");
    setPay({
      studentId: s.id,
      amount: balanceFor(db, s),
      method: student ? "UPI" : "Cash",
      outcome: "success",
    });
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    await new Promise((r) => setTimeout(r, 450));
    try {
      if (student && pay.outcome === "failure")
        throw Error(
          "Simulated payment failed. No money was transferred and your balance has not changed.",
        );
      let result;
      update((d) => {
        result = recordPayment(d, {
          ...pay,
          studentId: student ? own.id : pay.studentId,
        });
        return result.db;
      });
      setReceipt(result.payment);
      setPay(null);
      notify(
        student
          ? "Demo payment successful. Your receipt is ready."
          : "Payment recorded. The ledger is up to date.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  function saveFees(e) {
    e.preventDefault();
    setError("");
    const n = Number(config.fees);
    if (!Number.isFinite(n) || n < paidFor(db, config.id))
      return setError("Total fees must be at least the amount already paid.");
    update((d) => ({
      ...d,
      students: d.students.map((s) =>
        s.id === config.id ? { ...s, fees: n, dueDate: config.dueDate } : s,
      ),
    }));
    setConfig(null);
    notify("Fee structure updated.");
  }
  return (
    <>
      <PageHead
        eyebrow={
          student ? "A CLEAR VIEW, ALWAYS" : "EVERY CONTRIBUTION, ACCOUNTED FOR"
        }
        title={
          student ? "Your fees, at a glance." : "A little clarity. Every rupee."
        }
        subtitle={
          student
            ? "Your fee breakdown, payments and receipts in one place."
            : "Track contributions, understand balances, and keep things moving."
        }
      >
        {!student && (
          <>
            <button
              className="button secondary"
              onClick={() =>
                exportCsv(
                  "gyandhara-fees.csv",
                  [
                    "Student",
                    "Total fees",
                    "Paid",
                    "Balance",
                    "Due date",
                    "Status",
                  ],
                  filtered.map((s) => [
                    s.name,
                    s.fees,
                    paidFor(db, s.id),
                    balanceFor(db, s),
                    s.dueDate,
                    feeStatus(db, s),
                  ]),
                )
              }
            >
              <Download size={16} />
              Export ledger
            </button>
            <button
              className="button"
              onClick={() =>
                openPay(
                  db.students.find((s) => balanceFor(db, s) > 0) ||
                    db.students[0],
                )
              }
            >
              <Plus size={16} />
              Record payment
            </button>
          </>
        )}
      </PageHead>
      <div className="metrics-grid student-metrics">
        <Metric
          label="Total applicable fees"
          value={money(collected + outstanding)}
          icon={Wallet}
          detail={
            <span>
              {student
                ? "Your academic year fee"
                : "Across all enrolled students"}
            </span>
          }
        />
        <Metric
          label={student ? "Amount paid" : "Fees collected"}
          value={money(collected)}
          icon={IndianRupee}
          detail={<span>{payments.length} recorded payments</span>}
        />
        <Metric
          label="Outstanding balance"
          value={money(outstanding)}
          icon={Clock}
          tone="warm"
          detail={
            <span>
              {student
                ? `Due ${displayDate(own.dueDate)}`
                : "Awaiting contribution"}
            </span>
          }
        />
      </div>
      {student ? (
        <section className="fee-callout">
          <div>
            <Badge>{feeStatus(db, own)}</Badge>
            <h2>
              {balanceFor(db, own) > 0
                ? "One less thing to think about."
                : "You’re all settled up."}
            </h2>
            <p>
              {balanceFor(db, own) > 0
                ? `Your remaining balance is ${money(balanceFor(db, own))}. All payments here are simulated.`
                : "There are no outstanding fees for your current fee structure."}
            </p>
          </div>
          <button
            className="button"
            disabled={!balanceFor(db, own)}
            onClick={() => openPay(own)}
          >
            Pay now <ArrowUpRight size={17} />
          </button>
        </section>
      ) : (
        <div className="fees-chart-grid">
          <section className="panel">
            <PanelHead
              title="The collection picture"
              subtitle="Monthly fee contributions"
            />
            <CollectionChart db={db} />
          </section>
          <section className="panel balance-chart">
            <PanelHead
              title="In balance"
              subtitle="Academic year fee position"
            />
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Collected", value: collected },
                      { name: "Outstanding", value: outstanding },
                    ]}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={76}
                    strokeWidth={0}
                  >
                    <Cell fill="#37786c" />
                    <Cell fill="#e9c785" />
                  </Pie>
                  <Tooltip formatter={(v) => money(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="donut-legend">
              <span>
                <i />
                {money(collected)} collected
              </span>
              <span>
                <i />
                {money(outstanding)} outstanding
              </span>
            </div>
          </section>
        </div>
      )}
      {!student && (
        <section className="panel">
          <PanelHead
            title="Student fee ledger"
            subtitle="The complete picture for every learner"
          />
          <div className="toolbar">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search students…"
            />
            <select
              aria-label="Filter fee status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["All statuses", "Paid", "Partial", "Pending", "Overdue"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>TOTAL FEES</th>
                  <th>PAID</th>
                  <th>BALANCE</th>
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <button
                        className="person-cell person-button"
                        onClick={() => setHistory(s.id)}
                      >
                        <Avatar size="small" name={s.name} />
                        <div>
                          <strong>{s.name}</strong>
                          <small>{s.className}</small>
                        </div>
                      </button>
                    </td>
                    <td>{money(s.fees)}</td>
                    <td className="green-text">{money(paidFor(db, s.id))}</td>
                    <td className="amount">{money(balanceFor(db, s))}</td>
                    <td className="muted">{displayDate(s.dueDate)}</td>
                    <td>
                      <Badge>{feeStatus(db, s)}</Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="small-button"
                          disabled={!balanceFor(db, s)}
                          onClick={() => openPay(s)}
                        >
                          Record
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Configure fees for ${s.name}`}
                          onClick={() => {
                            setError("");
                            setConfig(s);
                          }}
                        >
                          <Settings2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && <Empty title="No matching fee records" />}
        </section>
      )}
      <section className="panel payment-history">
        <PanelHead
          title={student ? "Your payment history" : "Recent transactions"}
          subtitle="A record for every contribution"
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>RECEIPT</th>
                {!student && <th>STUDENT</th>}
                <th>DATE</th>
                <th>METHOD</th>
                <th>AMOUNT</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.receipt}</td>
                  {!student && (
                    <td>
                      {db.students.find((s) => s.id === p.studentId)?.name}
                    </td>
                  )}
                  <td>{displayDate(p.date)}</td>
                  <td>
                    <Badge>{p.method}</Badge>
                  </td>
                  <td className="amount">{money(p.amount)}</td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => setReceipt(p)}
                    >
                      <ReceiptText size={15} />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!payments.length && (
          <Empty
            title="A fresh start"
            description="Successful demo payments will appear here."
          />
        )}
      </section>
      {pay && (
        <Modal
          title={
            student ? "A simple, simulated payment" : "Record a contribution"
          }
          subtitle="Demo only. No real money is transferred."
          onClose={() => !busy && setPay(null)}
        >
          <form onSubmit={submit}>
            {!student && (
              <Field label="Student">
                <select
                  value={pay.studentId}
                  onChange={(e) => {
                    const s = db.students.find((s) => s.id === e.target.value);
                    setPay({
                      ...pay,
                      studentId: s.id,
                      amount: balanceFor(db, s),
                    });
                  }}
                >
                  {db.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {money(balanceFor(db, s))} due
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Amount (₹)">
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                max={balanceFor(
                  db,
                  db.students.find((s) => s.id === pay.studentId),
                )}
                value={pay.amount}
                onChange={(e) => setPay({ ...pay, amount: e.target.value })}
              />
            </Field>
            <Field label="Payment method">
              <select
                value={pay.method}
                onChange={(e) => setPay({ ...pay, method: e.target.value })}
              >
                {["UPI", "Cash", "Bank transfer"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            {student && (
              <Field label="Demo outcome">
                <select
                  value={pay.outcome}
                  onChange={(e) => setPay({ ...pay, outcome: e.target.value })}
                >
                  <option value="success">Simulate successful payment</option>
                  <option value="failure">Simulate failed payment</option>
                </select>
              </Field>
            )}
            <DemoNote>
              No bank details, UPI IDs or payment credentials are collected.
            </DemoNote>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => setPay(null)}
              >
                Cancel
              </button>
              <button className="button" disabled={busy}>
                {busy
                  ? "Processing simulation…"
                  : student
                    ? "Simulate payment"
                    : "Record payment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {config && (
        <Modal
          title="Configure student fees"
          subtitle={config.name}
          onClose={() => setConfig(null)}
        >
          <form onSubmit={saveFees}>
            <Field label="Total applicable fees (₹)">
              <input
                required
                type="number"
                min={paidFor(db, config.id)}
                step="0.01"
                value={config.fees}
                onChange={(e) => setConfig({ ...config, fees: e.target.value })}
              />
            </Field>
            <Field label="Due date">
              <input
                required
                type="date"
                value={config.dueDate}
                onChange={(e) =>
                  setConfig({ ...config, dueDate: e.target.value })
                }
              />
            </Field>
            <p className="helper-text">
              Already paid: {money(paidFor(db, config.id))}. Existing payments
              stay in the ledger.
            </p>
            {error && <div className="form-error">{error}</div>}
            <div className="modal-actions">
              <button className="button">Save fee structure</button>
            </div>
          </form>
        </Modal>
      )}
      {receipt && (
        <Receipt
          payment={receipt}
          student={db.students.find((s) => s.id === receipt.studentId)}
          onClose={() => setReceipt(null)}
        />
      )}{" "}
      {history && (
        <Modal
          wide
          title={`${db.students.find((s) => s.id === history)?.name} · Fee ledger`}
          onClose={() => setHistory(null)}
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {db.payments
                  .filter((p) => p.studentId === history)
                  .map((p) => (
                    <tr key={p.id}>
                      <td>{displayDate(p.date)}</td>
                      <td>{p.method}</td>
                      <td>{money(p.amount)}</td>
                      <td>
                        <button
                          className="text-button"
                          onClick={() => {
                            setHistory(null);
                            setReceipt(p);
                          }}
                        >
                          {p.receipt}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!db.payments.some((p) => p.studentId === history) && (
            <Empty title="No payments recorded yet" />
          )}
        </Modal>
      )}
    </>
  );
}
