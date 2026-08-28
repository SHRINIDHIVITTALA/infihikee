import { useSitePages } from "../context/SitePagesContext";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function TermsPage() {
  const { pages } = useSitePages();
  usePageMeta({ title: pages.terms.heading, description: pages.terms.body.slice(0, 160) });

  return (
    <div className="static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">{pages.terms.heading}</h1>
        <p className="static-page__body">{pages.terms.body}</p>
      </div>
    </div>
  );
}
