import { useSitePages } from "../context/SitePagesContext";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function AboutPage() {
  const { pages } = useSitePages();
  usePageMeta({ title: pages.about.heading, description: pages.about.body.slice(0, 160) });

  return (
    <div className="static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">{pages.about.heading}</h1>
        <p className="static-page__body">{pages.about.body}</p>
      </div>
    </div>
  );
}
