import { jsPDF } from "jspdf";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const HEADER_H = 22;
const FOOTER_H = 14;
const CONTENT_TOP = HEADER_H + 6;
const CONTENT_BOTTOM = PAGE_H - FOOTER_H - 4;

// Converts an image URL to a data URL so jsPDF can embed it — addImage
// can't fetch remote URLs itself. Fails silently (returns null) so a
// missing/CORS-blocked logo never blocks the itinerary download itself.
async function loadImageAsDataURL(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawHeader(doc, logoDataUrl, businessName) {
  doc.setFillColor(12, 12, 24);
  doc.rect(0, 0, PAGE_W, HEADER_H, "F");
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", MARGIN, 5, 12, 12); } catch { /* unsupported format — skip */ }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(businessName, logoDataUrl ? MARGIN + 16 : MARGIN, 13.5);
}

function drawFooter(doc, settings, pageNum, pageCount) {
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, PAGE_H - FOOTER_H, PAGE_W - MARGIN, PAGE_H - FOOTER_H);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  const left = [settings.phone, settings.instagram && settings.instagram.replace("https://www.instagram.com/", "@")]
    .filter(Boolean)
    .join("   ·   ");
  doc.text(left, MARGIN, PAGE_H - FOOTER_H + 8);
  doc.text(`Page ${pageNum} of ${pageCount}`, PAGE_W - MARGIN, PAGE_H - FOOTER_H + 8, { align: "right" });
}

// Builds a branded PDF itinerary and triggers a browser download. Header
// (logo + business name) and footer (phone, Instagram, page number) are
// redrawn on every page; body content flows with automatic page breaks.
export async function downloadItinerary(item, settings) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const logoDataUrl = await loadImageAsDataURL(settings.logoUrl || "/logo.png");
  const contentWidth = PAGE_W - MARGIN * 2;
  let y = CONTENT_TOP;

  const ensureSpace = (needed) => {
    if (y + needed > CONTENT_BOTTOM) {
      doc.addPage();
      y = CONTENT_TOP;
    }
  };

  const heading = (text) => {
    ensureSpace(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(text, MARGIN, y);
    y += 7;
  };

  const paragraph = (text, { bold = false, size = 10, color = [50, 50, 50] } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line) => {
      ensureSpace(6);
      doc.text(line, MARGIN, y);
      y += 5.5;
    });
  };

  const bullet = (text) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(`•  ${text}`, contentWidth - 4);
    lines.forEach((line) => {
      ensureSpace(6);
      doc.text(line, MARGIN + 2, y);
      y += 5.5;
    });
  };

  paragraph(item.destination, { bold: true, size: 18, color: [10, 10, 10] });
  y += 1;
  paragraph([item.country, item.dates, item.duration].filter(Boolean).join("   ·   "), { size: 10, color: [110, 110, 110] });
  y += 4;

  if (item.description) {
    paragraph(item.description);
    y += 4;
  }

  if (item.itinerary?.length) {
    heading("Day-by-Day Itinerary");
    item.itinerary.forEach((day) => {
      paragraph(`Day ${day.day}: ${day.title}`, { bold: true });
      if (day.description) paragraph(day.description);
      y += 2;
    });
    y += 2;
  }

  if (item.highlights?.length) {
    heading("Highlights");
    item.highlights.forEach(bullet);
    y += 4;
  }

  if (item.includes?.length) {
    heading("What's Included");
    item.includes.forEach(bullet);
    y += 4;
  }

  if (item.excludes?.length) {
    heading("What's Not Included");
    item.excludes.forEach(bullet);
    y += 4;
  }

  if (item.cancellationPolicy) {
    heading("Cancellation & Refund Rules");
    paragraph(item.cancellationPolicy);
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawHeader(doc, logoDataUrl, settings.businessName);
    drawFooter(doc, settings, i, pageCount);
  }

  doc.save(`${item.destination.replace(/[^a-z0-9]+/gi, "-")}-itinerary.pdf`);
}
