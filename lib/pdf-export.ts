import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface TicketExportRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdBy: string;
  assignedTo: string;
  createdAt: string;
}

export function generateTicketsPDF(
  tickets: TicketExportRow[],
  title = "IT Support Tickets Report"
) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

  autoTable(doc, {
    startY: 38,
    head: [
      ["ID", "Title", "Status", "Priority", "Category", "Created By", "Assigned", "Date"],
    ],
    body: tickets.map((t) => [
      t.id.slice(-6),
      t.title.slice(0, 30),
      t.status,
      t.priority,
      t.category,
      t.createdBy,
      t.assignedTo || "-",
      t.createdAt,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  return doc.output("arraybuffer");
}
