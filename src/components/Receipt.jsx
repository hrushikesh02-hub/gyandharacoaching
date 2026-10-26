import React from "react";
import { Download, Printer, Check } from "lucide-react";
import { Modal, Brand } from "./UI";
import { money, displayDate, downloadFile } from "../utils/domain";
export default function Receipt({ payment, student, onClose }) {
  const body = `GYANDHARA COACHING CLASSES\nDEMO PAYMENT RECEIPT — NO MONEY TRANSFERRED\n\nReceipt: ${payment.receipt}\nStudent: ${student.name}\nClass: ${student.className}\nDate: ${displayDate(payment.date)}\nMethod: ${payment.method}\nAmount: ${money(payment.amount)}\n\nThis receipt is for a simulated frontend payment only.`;
  return (
    <Modal title="A contribution, recorded." onClose={onClose}>
      <div className="receipt print-area">
        <Brand small />
        <div className="receipt-seal">
          <Check size={24} />
        </div>
        <p className="eyebrow">DEMO PAYMENT RECEIPT</p>
        <h2>{money(payment.amount)}</h2>
        <p>Simulated payment successful</p>
        <dl>
          {[
            ["Receipt number", payment.receipt],
            ["Student", student.name],
            ["Class", student.className],
            ["Date", displayDate(payment.date)],
            ["Method", payment.method],
          ].map(([a, b]) => (
            <div key={a}>
              <dt>{a}</dt>
              <dd>{b}</dd>
            </div>
          ))}
        </dl>
        <small>No real money was transferred. This is a demo receipt.</small>
      </div>
      <div className="modal-actions">
        <button className="button secondary" onClick={() => window.print()}>
          <Printer size={16} />
          Print
        </button>
        <button
          className="button"
          onClick={() => downloadFile(`${payment.receipt}.txt`, body)}
        >
          <Download size={16} />
          Download receipt
        </button>
      </div>
    </Modal>
  );
}
