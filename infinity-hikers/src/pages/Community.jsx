import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCommunity } from "../context/CommunityContext";
import { useSettings } from "../context/SettingsContext";
import { useTestimonials } from "../context/TestimonialsContext";
import { useItineraries } from "../context/ItineraryContext";
import { getDestinationsCoveredCount, getAverageTestimonialRating } from "../utils/stats";
import "./Community.css";

export default function Community() {
  const { photos: GALLERY_PHOTOS, posts: TRIP_REPORTS } = useCommunity();
  const { settings } = useSettings();
  const { testimonials } = useTestimonials();
  const { getActiveItineraries } = useItineraries();

  const [activeTab, setActiveTab] = useState("gallery");
  const [filter, setFilter] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [likedPhotos, setLikedPhotos] = useState({});
  const [likedReports, setLikedReports] = useState({});

  // Built from the real photos/reports instead of a hardcoded 2-destination
  // list, so a newly added photo's destination always has a working filter
  // chip — see MOCK_DATA_AUDIT.md.
  const DESTINATIONS = useMemo(() => {
    const seen = new Set();
    const dests = [];
    for (const item of [...GALLERY_PHOTOS, ...TRIP_REPORTS]) {
      if (item.destination && !seen.has(item.destination)) {
        seen.add(item.destination);
        dests.push(item.destination);
      }
    }
    return ["All", ...dests];
  }, [GALLERY_PHOTOS, TRIP_REPORTS]);

  // Real, auto-updating numbers instead of hand-typed constants that
  // disagreed with the homepage's own stats — see MOCK_DATA_AUDIT.md.
  const STATS = [
    { value: `${settings.travelerCount}+`, label: "Adventurers" },
    { value: `${getDestinationsCoveredCount(getActiveItineraries())}+`, label: "Destinations" },
    { value: `${GALLERY_PHOTOS.length}`, label: "Photos Shared" },
    { value: `${getAverageTestimonialRating(testimonials)}★`, label: "Avg Rating" },
  ];

  const filteredPhotos = filter === "All" ? GALLERY_PHOTOS : GALLERY_PHOTOS.filter((p) => p.destination === filter);
  const filteredReports = filter === "All" ? TRIP_REPORTS : TRIP_REPORTS.filter((r) => r.destination === filter);

  const togglePhotoLike = (id) => setLikedPhotos((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleReportLike = (id) => setLikedReports((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="community">
      {/* Hero */}
      <div className="community__hero">
        <motion.div
          className="community__hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="community__eyebrow">Real people. Real trips.</span>
          <h1 className="community__title">TRAVELER<br />STORIES</h1>
          <p className="community__sub">Photos and stories straight from our community of adventurers</p>
        </motion.div>

        {/* Stats strip */}
        <div className="community__stats">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="community__stat"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
            >
              <span className="community__stat-value">{s.value}</span>
              <span className="community__stat-label">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="community__body">
        {/* Tabs + Filters */}
        <div className="community__controls">
          <div className="community__tabs">
            {[
              { key: "gallery", label: "Photo Gallery" },
              { key: "reports", label: "Trip Reports" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`community__tab ${activeTab === tab.key ? "community__tab--active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="community__filters">
            {DESTINATIONS.map((d) => (
              <button
                key={d}
                className={`community__filter-chip ${filter === d ? "community__filter-chip--active" : ""}`}
                onClick={() => setFilter(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "gallery" ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="community__gallery"
            >
              {filteredPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  className={`community__photo ${photo.featured ? "community__photo--featured" : ""}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedPhoto(photo)}
                  layout
                >
                  <img src={photo.src} alt={photo.caption} loading="lazy" />
                  <div className="community__photo-overlay">
                    <span className="community__photo-dest">{photo.destination}</span>
                    <p className="community__photo-caption">{photo.caption}</p>
                    <div className="community__photo-meta">
                      <span className="community__photo-author">📷 {photo.author}</span>
                      <button
                        className={`community__like-btn ${likedPhotos[photo.id] ? "community__like-btn--liked" : ""}`}
                        onClick={(e) => { e.stopPropagation(); togglePhotoLike(photo.id); }}
                      >
                        <span className="community__heart">{likedPhotos[photo.id] ? "♥" : "♡"}</span>
                        {photo.likes + (likedPhotos[photo.id] ? 1 : 0)}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="reports"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="community__reports"
            >
              {filteredReports.map((report, i) => (
                <motion.article
                  key={report.id}
                  className="community__report"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.09 }}
                >
                  <div
                    className="community__report-img"
                    style={{ backgroundImage: `url(${report.image})` }}
                  />
                  <div className="community__report-body">
                    <span className="community__report-dest">{report.destination}</span>
                    <h3 className="community__report-title">{report.title}</h3>
                    <p className="community__report-excerpt">{report.excerpt}</p>
                    <div className="community__report-footer">
                      <div className="community__report-author">
                        <img src={report.avatar} alt={report.author} />
                        <div>
                          <strong>{report.author}</strong>
                          <span>{report.date} · {report.readTime}</span>
                        </div>
                      </div>
                      <button
                        className={`community__like-btn ${likedReports[report.id] ? "community__like-btn--liked" : ""}`}
                        onClick={() => toggleReportLike(report.id)}
                      >
                        <span className="community__heart">{likedReports[report.id] ? "♥" : "♡"}</span>
                        {report.likes + (likedReports[report.id] ? 1 : 0)}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="community__lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="community__lightbox-inner"
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedPhoto.src} alt={selectedPhoto.caption} />
              <div className="community__lightbox-info">
                <span className="community__lightbox-dest">{selectedPhoto.destination}</span>
                <h3>{selectedPhoto.caption}</h3>
                <p>📷 {selectedPhoto.author}</p>
              </div>
              <button className="community__lightbox-close" onClick={() => setSelectedPhoto(null)}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
