import { useState } from "react";
import { useSitePages } from "../context/SitePagesContext";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function FAQPage() {
  const { pages } = useSitePages();
  // Tracked by question text rather than array index — FAQs have no stable
  // id, and an index would silently swap the open item to a different
  // question if an admin reorders or inserts one above it.
  const [openQuestion, setOpenQuestion] = useState(pages.faqs[0]?.question ?? null);
  usePageMeta({ title: "Frequently Asked Questions", description: "Answers to common questions about booking and travelling with us." });

  return (
    <div className="static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">Frequently Asked Questions</h1>
        {pages.faqs.length === 0 ? (
          <p className="static-page__empty">No questions added yet.</p>
        ) : (
          <div className="faq-list">
            {pages.faqs.map((faq) => (
              <div key={faq.question} className="faq-item">
                <button className="faq-item__q" onClick={() => setOpenQuestion(openQuestion === faq.question ? null : faq.question)}>
                  {faq.question}
                  <span>{openQuestion === faq.question ? "−" : "+"}</span>
                </button>
                {openQuestion === faq.question && <p className="faq-item__a">{faq.answer}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
