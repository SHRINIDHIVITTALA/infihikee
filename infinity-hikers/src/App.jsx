import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ItineraryProvider } from "./context/ItineraryContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CompareProvider, useCompare } from "./context/CompareContext";
import { TestimonialsProvider } from "./context/TestimonialsContext";
import { SettingsProvider } from "./context/SettingsContext";
import { HeroProvider } from "./context/HeroContext";
import { SitePagesProvider } from "./context/SitePagesContext";
import { PricingRulesProvider } from "./context/PricingRulesContext";
import { CatalogProvider } from "./context/CatalogContext";
import { NavLinksProvider } from "./context/NavLinksContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { LeadsProvider } from "./context/LeadsContext";
import { CommunityProvider } from "./context/CommunityContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot";
import Preloader from "./components/Preloader";
import LeadCapture from "./components/LeadCapture";
import CompareModal from "./components/CompareModal";
import HomePage from "./pages/HomePage";
import DestinationsPage from "./pages/DestinationsPage";
import TreksPage from "./pages/TreksPage";
import PilgrimagesPage from "./pages/PilgrimagesPage";
import DestinationDetail from "./pages/DestinationDetail";
// Secondary pages are code-split. React's lazy() always suspends on its first render,
// even if the chunk is already downloaded, and that one empty frame was the flash
// between pages. So once a page is preloaded we render the loaded component directly.
function lazyPage(load) {
  let Loaded = null;
  let promise = null;
  const preload = () => {
    promise ??= load().then((mod) => { Loaded = mod.default; return mod; });
    return promise;
  };
  const Lazy = lazy(preload);
  function Page(props) {
    return Loaded ? <Loaded {...props} /> : <Lazy {...props} />;
  }
  Page.preload = preload;
  return Page;
}

const MapPage = lazyPage(() => import("./pages/MapPage"));
const Calculator = lazyPage(() => import("./pages/Calculator"));
const AdminPanel = lazyPage(() => import("./pages/AdminPanel"));
const TripPlanner = lazyPage(() => import("./pages/TripPlanner"));
const PackingList = lazyPage(() => import("./pages/PackingList"));
const Community = lazyPage(() => import("./pages/Community"));
const Sustainability = lazyPage(() => import("./pages/Sustainability"));
const AboutPage = lazyPage(() => import("./pages/AboutPage"));
const FAQPage = lazyPage(() => import("./pages/FAQPage"));
const TermsPage = lazyPage(() => import("./pages/TermsPage"));
const PrivacyPage = lazyPage(() => import("./pages/PrivacyPage"));
const LAZY_PAGES = [MapPage, Calculator, AdminPanel, TripPlanner, PackingList, Community, Sustainability, AboutPage, FAQPage, TermsPage, PrivacyPage];
import { initAnalytics, trackPageView } from "./utils/analytics";

function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: "5rem" }}>🏔️</div>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--brand-dark)" }}>404 — Page Not Found</h1>
      <p style={{ color: "var(--text-secondary)", maxWidth: "400px" }}>
        Looks like you've wandered off the trail. Let's get you back on track.
      </p>
      <a href="/" style={{ background: "var(--brand-orange)", color: "#fff", padding: "0.75rem 2rem", borderRadius: "100px", fontWeight: 600, textDecoration: "none", marginTop: "0.5rem" }}>
        Back to Home
      </a>
    </div>
  );
}

function ScrollToTopOnNav() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function CompareBar() {
  const { compareList, toggle } = useCompare();
  const [modalOpen, setModalOpen] = useState(false);

  if (compareList.length === 0) return null;

  // Show just the destination slug from the id (e.g. "sri" from "sri-lanka-aug-2026")
  const label = (id) => id.startsWith("sri-lanka-") ? "Sri Lanka" : id.split("-")[0].charAt(0).toUpperCase() + id.split("-")[0].slice(1);

  return (
    <>
      <motion.div
        className="cmp-bar"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
      >
        <div className="cmp-bar__slots">
          {[0, 1].map(i => (
            compareList[i] ? (
              <span key={i} className="cmp-bar__slot">
                {label(compareList[i])}
                <button className="cmp-bar__remove" onClick={() => toggle(compareList[i], { silent: true })}>✕</button>
              </span>
            ) : (
              <span key={i} className="cmp-bar__slot-empty">+ Add trip</span>
            )
          ))}
        </div>
        <div className="cmp-bar__sep" />
        <button
          className="cmp-bar__btn"
          disabled={compareList.length < 2}
          onClick={() => setModalOpen(true)}
        >
          Compare ⚖️
        </button>
      </motion.div>
      <CompareModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  useEffect(() => {
    const preload = () => LAZY_PAGES.forEach((page) => page.preload());
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preload, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(preload, 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <ScrollToTopOnNav />
      {!isAdmin && <Navbar />}
      <Suspense fallback={null}>
        <motion.main
          key={location.pathname}
          initial={{ y: 14 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/treks" element={<TreksPage />} />
            <Route path="/pilgrimages" element={<PilgrimagesPage />} />
            <Route path="/destination/:id" element={<DestinationDetail />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/trip-planner" element={<TripPlanner />} />
            <Route path="/packing-list" element={<PackingList />} />
            <Route path="/community" element={<Community />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </Suspense>
      {!isAdmin && <Footer />}
      <ScrollToTop />
      {!isAdmin && <Chatbot />}
      {!isAdmin && <LeadCapture />}
      {!isAdmin && <CompareBar />}
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(() => {
    try { return !sessionStorage.getItem("ih_preloader_done"); } catch { return false; }
  });

  useEffect(() => {
    initAnalytics();
  }, []);

  const handlePreloaderComplete = () => {
    try { sessionStorage.setItem("ih_preloader_done", "1"); } catch { /* storage is unavailable */ }
    setLoading(false);
  };

  return (
    <ThemeProvider>
      <ToastProvider>
      <SettingsProvider>
        <SitePagesProvider>
        <PricingRulesProvider>
        <CatalogProvider>
        <NavLinksProvider>
        <AdminAuthProvider>
        <TestimonialsProvider>
        <LeadsProvider>
        <CommunityProvider>
      <ItineraryProvider>
        <HeroProvider>
        <WishlistProvider>
          <CompareProvider>
            {loading ? (
              <Preloader onComplete={handlePreloaderComplete} />
            ) : (
              <Router>
                <AppContent />
              </Router>
            )}
          </CompareProvider>
        </WishlistProvider>
        </HeroProvider>
      </ItineraryProvider>
        </CommunityProvider>
        </LeadsProvider>
        </TestimonialsProvider>
        </AdminAuthProvider>
        </NavLinksProvider>
        </CatalogProvider>
        </PricingRulesProvider>
        </SitePagesProvider>
      </SettingsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
