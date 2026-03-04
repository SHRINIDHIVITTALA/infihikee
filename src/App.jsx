import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ItineraryProvider } from "./context/ItineraryContext";
import { ThemeProvider } from "./context/ThemeContext";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import FloatingParticles from "./components/FloatingParticles";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot";
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

function ScrollToTopOnNav() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return (
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
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <ThemeProvider>
      <ItineraryProvider>
        <Router>
          <CustomCursor />
          {showPreloader ? (
            <Preloader onComplete={() => setShowPreloader(false)} />
          ) : (
            <>
              <ScrollProgress />
              <FloatingParticles />
              <ScrollToTopOnNav />
              <Navbar />
              <AnimatedRoutes />
              <Footer />
              <ScrollToTop />
              <Chatbot />
            </>
          )}
        </Router>
      </ItineraryProvider>
    </ThemeProvider>
  );
}

export default App;
