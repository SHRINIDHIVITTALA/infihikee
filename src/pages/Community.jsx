import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Community.css";

const GALLERY_PHOTOS = [
  { id: 1, src: "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800", destination: "Sri Lanka", author: "Priya M.", caption: "Bentota Beach at sunset — magical!", likes: 124, featured: true },
  { id: 2, src: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=800", destination: "Sri Lanka", author: "Rahul K.", caption: "Madu River safari was worth every moment", likes: 89 },
  { id: 4, src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800", destination: "Bali", author: "Arjun D.", caption: "Tegallalang rice terraces", likes: 201, featured: true },
  { id: 7, src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800", destination: "Bali", author: "Ananya R.", caption: "Temple ceremony at Tanah Lot", likes: 98 },
  { id: 8, src: "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800", destination: "Sri Lanka", author: "Varun G.", caption: "Colombo after dark", likes: 178 },
  { id: 9, src: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=800", destination: "Sri Lanka", author: "Diya N.", caption: "Kandy temple visit in the morning", likes: 112 },
  { id: 11, src: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800", destination: "Bali", author: "Riya L.", caption: "Sunrise at Mount Batur", likes: 230, featured: true },
];

const TRIP_REPORTS = [
  {
    id: 1,
    title: "6 Days in Sri Lanka: A Group Traveler's Dream",
    author: "Priya Menon",
    avatar: "https://i.pravatar.cc/80?img=25",
    date: "Feb 2026",
    destination: "Sri Lanka",
    excerpt: "I was nervous about my first group trip, but the Infinity Pravasa team made it unforgettable. From Bentota Beach to the scenic coastal train journey, every moment was curated to perfection.",
    readTime: "5 min read",
    likes: 47,
    image: "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=900",
  },
  {
    id: 2,
    title: "Sri Lanka: Beaches, Tea Country & Culture",
    author: "Rahul Krishnamurthy",
    avatar: "https://i.pravatar.cc/80?img=12",
    date: "Apr 2025",
    destination: "Sri Lanka",
    excerpt: "From the Madu River safari to the Temple of the Tooth and tea-covered hills of Nuwara Eliya, every day felt like a new discovery. Sri Lanka is a destination full of warmth and wonder.",
    readTime: "8 min read",
    likes: 82,
    image: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=900",
  },
  {
    id: 4,
    title: "Bali: Beyond the Instagram Clichés",
    author: "Arjun Deshmukh",
    avatar: "https://i.pravatar.cc/80?img=18",
    date: "Dec 2025",
    destination: "Bali",
    excerpt: "Yes, the rice terraces are stunning. But the real Bali magic? It's in the temple ceremonies at dawn, the conversations with local artisans, and the sunrises from Mount Batur that make you question why you ever hit snooze.",
    readTime: "7 min read",
    likes: 104,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900",
  },
];

const DESTINATIONS = ["All", "Sri Lanka", "Bali"];

const STATS = [
  { value: "482+", label: "Adventurers" },
  { value: "2", label: "Destinations" },
  { value: "100+", label: "Photos Shared" },
  { value: "5★", label: "Avg Rating" },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState("gallery");
  const [filter, setFilter] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [likedPhotos, setLikedPhotos] = useState({});
  const [likedReports, setLikedReports] = useState({});

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
