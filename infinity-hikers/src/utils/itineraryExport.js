import { jsPDF } from "jspdf";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const HEADER_H = 22;
const FOOTER_H = 14;
const CONTENT_TOP = HEADER_H + 6;
const CONTENT_BOTTOM = PAGE_H - FOOTER_H - 4;
const BRAND_ORANGE = [249, 115, 22];

// jsPDF's built-in fonts (Helvetica/Times/Courier) only support the
// WinAnsi/Latin-1 code page — any character above U+00FF (★, ₹, →, emoji,
// curly quotes…) either silently drops or corrupts the whole line's glyph
// spacing (confirmed: "3★ Hotel" rendered as "3&  H o t e l" with every
// character padded). Swap the common offenders for ASCII equivalents, then
// strip anything else outside that range as a safety net.
function sanitizeForPdf(text) {
  if (text == null) return "";
  return String(text)
    .replace(/(\d)\s*[★⭐]/g, "$1-Star")
    .replace(/[★⭐]/g, "")
    .replace(/₹/g, "Rs. ")
    .replace(/[–—]/g, "-")
    .replace(/[➝→]/g, "->")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .split("")
    .filter((ch) => ch.codePointAt(0) <= 0xff)
    .join("")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

// Converts an image URL to a data URL so jsPDF can embed it — addImage
// can't fetch remote URLs itself. Fails silently (returns null) so a
// missing/CORS-blocked image never blocks the itinerary download itself.
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

// jsPDF needs an explicit format string matching the actual image type —
// read it off the data URL's mime type rather than assuming, and skip
// drawing entirely (rather than throwing) for anything it can't handle.
function addImageAuto(doc, dataUrl, x, y, w, h) {
  const mime = /^data:image\/(\w+);/.exec(dataUrl)?.[1]?.toUpperCase();
  const format = { JPEG: "JPEG", JPG: "JPEG", PNG: "PNG", WEBP: "WEBP" }[mime];
  if (!format) return false;
  try {
    doc.addImage(dataUrl, format, x, y, w, h);
    return true;
  } catch {
    return false;
  }
}

function drawHeader(doc, logoDataUrl, businessName) {
  doc.setFillColor(12, 12, 24);
  doc.rect(0, 0, PAGE_W, HEADER_H, "F");
  let textX = MARGIN;
  if (logoDataUrl && addImageAuto(doc, logoDataUrl, MARGIN, 5, 12, 12)) {
    textX = MARGIN + 16;
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(sanitizeForPdf(businessName), textX, 13.5);
}

function drawFooter(doc, settings, pageNum, pageCount) {
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, PAGE_H - FOOTER_H, PAGE_W - MARGIN, PAGE_H - FOOTER_H);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  const left = [settings.phone, settings.instagram && settings.instagram.replace("https://www.instagram.com/", "@")]
    .filter(Boolean)
    .map(sanitizeForPdf)
    .join("   ·   ");
  doc.text(left, MARGIN, PAGE_H - FOOTER_H + 8);
  doc.text(`Page ${pageNum} of ${pageCount}`, PAGE_W - MARGIN, PAGE_H - FOOTER_H + 8, { align: "right" });
}

// Builds a branded PDF itinerary and triggers a browser download. Header
// (logo + business name) and footer (phone, Instagram, page number) are
// redrawn on every page; body content flows with automatic page breaks.
export async function downloadItinerary(item, settings) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const [logoDataUrl, coverDataUrl] = await Promise.all([
    loadImageAsDataURL(settings.logoUrl || "/logo.png"),
    item.image ? loadImageAsDataURL(item.image) : Promise.resolve(null),
  ]);
  const contentWidth = PAGE_W - MARGIN * 2;
  let y = CONTENT_TOP;

  const ensureSpace = (needed) => {
    if (y + needed > CONTENT_BOTTOM) {
      doc.addPage();
      y = CONTENT_TOP;
    }
  };

  const heading = (text) => {
    ensureSpace(11);
    doc.setFillColor(...BRAND_ORANGE);
    doc.rect(MARGIN, y - 3.6, 1.4, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(sanitizeForPdf(text), MARGIN + 4, y);
    y += 7.5;
  };

  const paragraph = (text, { bold = false, size = 10, color = [50, 50, 50] } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(sanitizeForPdf(text), contentWidth);
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
    const lines = doc.splitTextToSize(`-  ${sanitizeForPdf(text)}`, contentWidth - 4);
    lines.forEach((line) => {
      ensureSpace(6);
      doc.text(line, MARGIN + 2, y);
      y += 5.5;
    });
  };

  // Cover photo, full content width, fixed 16:9-ish band under the header —
  // draws only if the tour has an image and it loaded; otherwise everything
  // below just shifts up, so a missing photo never leaves an empty gap.
  if (coverDataUrl) {
    const coverH = 65;
    if (addImageAuto(doc, coverDataUrl, MARGIN, y, contentWidth, coverH)) {
      doc.setDrawColor(230, 230, 230);
      doc.rect(MARGIN, y, contentWidth, coverH);
      y += coverH + 7;
    }
  }

  paragraph(item.destination, { bold: true, size: 20, color: [10, 10, 10] });
  doc.setFillColor(...BRAND_ORANGE);
  doc.rect(MARGIN, y, 22, 1, "F");
  y += 5;
  paragraph([item.country, item.dates, item.duration].filter(Boolean).join("   ·   "), { size: 10, color: [110, 110, 110] });
  y += 5;

  // "At a glance" chips — duration/price/difficulty/season as small tinted
  // pills instead of another line of plain text, so the page reads as a
  // designed document rather than a text dump.
  const chips = [
    item.duration && `${item.duration}`,
    item.price ? `${formatChipPrice(item.price, settings.currency)}/person` : null,
    item.difficulty,
    item.bestSeason && `Best: ${item.bestSeason}`,
  ].filter(Boolean);
  if (chips.length) {
    ensureSpace(11);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    let cx = MARGIN;
    chips.forEach((chip) => {
      const w = doc.getTextWidth(chip) + 7;
      if (cx + w > MARGIN + contentWidth) { cx = MARGIN; y += 9; ensureSpace(9); }
      doc.setFillColor(255, 243, 230);
      doc.setDrawColor(...BRAND_ORANGE);
      doc.roundedRect(cx, y - 5, w, 7, 2, 2, "FD");
      doc.setTextColor(...BRAND_ORANGE);
      doc.text(chip, cx + 3.5, y - 0.5);
      cx += w + 3;
    });
    y += 9;
  }

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

// Local, PDF-only formatter — the shared formatMoney() emits a currency
// symbol (₹, €, £…) that sanitizeForPdf would otherwise have to strip
// per-call; keeping the substitution here keeps that logic in one place.
function formatChipPrice(amount, code) {
  const symbols = { INR: "Rs. ", USD: "$", EUR: "EUR ", GBP: "GBP ", AED: "AED " };
  const symbol = symbols[code] || "Rs. ";
  return `${symbol}${(Number(amount) || 0).toLocaleString("en-IN")}`;
}
