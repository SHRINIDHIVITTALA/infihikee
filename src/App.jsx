import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ItineraryProvider } from "./context/ItineraryContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CompareProvider, useCompare } from "./context/CompareContext";
import { TestimonialsProvider } from "./context/TestimonialsContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot";
import Preloader from "./components/Preloader";
import LeadCapture from "./components/LeadCapture";
import CompareModal from "./components/CompareModal";
import HomePage from "./pages/HomePage";
import DestinationsPage from "./pages/DestinationsPage";
import DestinationDetail from "./pages/DestinationDetail";
import MapPage from "./pages/MapPage";
import Calculator from "./pages/Calculator";
import AdminPanel from "./pages/AdminPanel";
import TripPlanner from "./pages/TripPlanner";
import PackingList from "./pages/PackingList";
import Community from "./pages/Community";
import Sustainability from "./pages/Sustainability";
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

function WhatsAppButton() {
  const { waLink } = useSettings();
  return (
    <a
      href={waLink("Hi! I'm interested in booking a trip with Infinity Hikers.")}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
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

  // Show just the destination slug from the id (e.g. "singapore" from "singapore-apr-2026")
  const label = (id) => id.split("-")[0].charAt(0).toUpperCase() + id.split("-")[0].slice(1);

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
                <button className="cmp-bar__remove" onClick={() => toggle(compareList[i])}>✕</button>
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

  return (
    <>
      <ScrollToTopOnNav />
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destination/:id" element={<DestinationDetail />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/trip-planner" element={<TripPlanner />} />
            <Route path="/packing-list" element={<PackingList />} />
            <Route path="/community" element={<Community />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      {!isAdmin && <Footer />}
      <ScrollToTop />
      {!isAdmin && <Chatbot />}
      {!isAdmin && <WhatsAppButton />}
      {!isAdmin && <LeadCapture />}
      {!isAdmin && <CompareBar />}
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(
    () => !sessionStorage.getItem("ih_preloader_done")
  );

  useEffect(() => {
    initAnalytics();
  }, []);

  const handlePreloaderComplete = () => {
    sessionStorage.setItem("ih_preloader_done", "1");
    setLoading(false);
  };

  return (
    <ThemeProvider>
      <SettingsProvider>
        <TestimonialsProvider>
      <ItineraryProvider>
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
      </ItineraryProvider>
        </TestimonialsProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
