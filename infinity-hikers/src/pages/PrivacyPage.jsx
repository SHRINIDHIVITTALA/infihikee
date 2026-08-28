import { useSitePages } from "../context/SitePagesContext";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function PrivacyPage() {
  const { pages } = useSitePages();
  usePageMeta({ title: pages.privacy.heading, description: pages.privacy.body.slice(0, 160) });

  return (
    <div className="static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">{pages.privacy.heading}</h1>
        <p className="static-page__body">{pages.privacy.body}</p>
      </div>
    </div>
  );
}
