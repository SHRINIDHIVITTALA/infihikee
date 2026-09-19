// Builds a plain-text itinerary summary and triggers a browser download —
// no PDF library dependency, works everywhere, and is easy to read even in
// Notes/WhatsApp if the visitor just pastes it there.
export function downloadItinerary(item, businessName) {
  const lines = [];
  lines.push(`${item.destination} — ${businessName}`);
  lines.push(item.country || "");
  lines.push(item.dates || "");
  lines.push(item.duration || "");
  lines.push("");
  if (item.description) { lines.push(item.description); lines.push(""); }

  if (item.itinerary?.length) {
    lines.push("DAY-BY-DAY ITINERARY");
    item.itinerary.forEach((day) => {
      lines.push(`Day ${day.day}: ${day.title}`);
      if (day.description) lines.push(`  ${day.description}`);
    });
    lines.push("");
  }

  if (item.highlights?.length) {
    lines.push("HIGHLIGHTS");
    item.highlights.forEach((h) => lines.push(`- ${h}`));
    lines.push("");
  }

  if (item.includes?.length) {
    lines.push("WHAT'S INCLUDED");
    item.includes.forEach((inc) => lines.push(`- ${inc}`));
    lines.push("");
  }

  if (item.excludes?.length) {
    lines.push("WHAT'S NOT INCLUDED");
    item.excludes.forEach((exc) => lines.push(`- ${exc}`));
    lines.push("");
  }

  if (item.cancellationPolicy) {
    lines.push("CANCELLATION & REFUND RULES");
    lines.push(item.cancellationPolicy);
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.destination.replace(/[^a-z0-9]+/gi, "-")}-itinerary.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
