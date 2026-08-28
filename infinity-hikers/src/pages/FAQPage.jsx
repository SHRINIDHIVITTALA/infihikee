import { useState } from "react";
import { useSitePages } from "../context/SitePagesContext";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function FAQPage() {
  const { pages } = useSitePages();
  const [openIndex, setOpenIndex] = useState(0);
  usePageMeta({ title: "Frequently Asked Questions", description: "Answers to common questions about booking and travelling with us." });

  return (
    <div className="static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">Frequently Asked Questions</h1>
        {pages.faqs.length === 0 ? (
          <p className="static-page__empty">No questions added yet.</p>
        ) : (
          <div className="faq-list">
            {pages.faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-item__q" onClick={() => setOpenIndex(openIndex === i ? -1 : i)}>
                  {faq.question}
                  <span>{openIndex === i ? "−" : "+"}</span>
                </button>
                {openIndex === i && <p className="faq-item__a">{faq.answer}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
