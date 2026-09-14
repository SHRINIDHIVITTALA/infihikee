import { useState, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useItineraries } from "../context/ItineraryContext";
import { useTestimonials } from "../context/TestimonialsContext";
import { useSettings } from "../context/SettingsContext";
import { useHeroSlides } from "../context/HeroContext";
import { useSitePages } from "../context/SitePagesContext";
import { usePricingRules } from "../context/PricingRulesContext";
import { formatHeroDates, todayISO } from "../utils/formatDates";
import { resolveHeroSlide, indexToursById } from "../utils/heroSlides";
import { uploadImages, isSupabaseConfigured, validateFile, MAX_IMAGE_MB } from "../utils/imageUpload";
import { CURRENCY_OPTIONS, formatMoney } from "../utils/currency";
import { deriveScope, ROUTED_CATEGORIES } from "../utils/catalog";
import { useCatalog } from "../context/CatalogContext";
import { useNavLinks } from "../context/NavLinksContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Map, MessageSquare, Settings, MessageCircle,
  Edit, Trash2, X, Plus, MapPin, LogOut, Star, Phone, Instagram,
  Mail, Save, ChevronDown, ChevronUp, Image as ImageIcon, ArrowUp, ArrowDown,
  SlidersHorizontal, Eye, EyeOff,
} from "lucide-react";
import "./AdminPanel.css";

const SIDEBAR = [
  { id: "dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { id: "tours",     label: "Tours",        icon: Map },
  { id: "catalog",   label: "Trip Types & Regions", icon: SlidersHorizontal },
  { id: "navigation", label: "Menus & Links", icon: Map },
  { id: "hero",      label: "Homepage Banner", icon: ImageIcon },
  { id: "testimonials", label: "Reviews", icon: MessageSquare },
  { id: "pages",     label: "Website Pages", icon: Edit },
  { id: "pricing",   label: "Trip Calculator", icon: Star },
  { id: "settings",  label: "Settings",     icon: Settings },
  { id: "leads",     label: "Enquiries",    icon: MessageCircle },
];

const MODAL_TABS = ["General", "Content", "Day-by-Day Plan", "Payment & Rules", "Pricing"];

const IMAGE_URL_RE = /^https?:\/\/\S+$/i;

// Browse pages with a route of their own (see ROUTED_CATEGORIES in
// DestinationsPage) — each gets an editable eyebrow/title/subtitle.
const INTRO_PAGE_TABS = [
  { id: "treksIntro", label: "Treks Page Intro" },
  { id: "pilgrimagesIntro", label: "Pilgrimages Page Intro" },
];

// Uploaded paths look like "tours/1699999999999-beach-sunset.jpg" — strip the
// folder and the upload-time prefix so the admin sees the original filename.
function fileNameFromUrl(url) {
  try {
    const base = decodeURIComponent(url.split("?")[0].split("/").pop() || "");
    return base.replace(/^\d+-/, "") || url;
  } catch {
    return url;
  }
}

// "active"/"inactive" is how the status is stored; the UI says visible/hidden,
// which is what it actually means to someone running the site.
const VISIBILITY_FILTERS = [
  { id: "all",      label: "All" },
  { id: "active",   label: "Visible" },
  { id: "inactive", label: "Hidden" },
];

function VisibilityFilter({ value, onChange, records }) {
  const counts = {
    all: records.length,
    active: records.filter((r) => r.status === "active").length,
    inactive: records.filter((r) => r.status !== "active").length,
  };
  return (
    <div className="vis-filter" role="group" aria-label="Filter by visibility">
      {VISIBILITY_FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          className={`vis-filter__btn ${value === f.id ? "active" : ""}`}
          onClick={() => onChange(f.id)}
        >
          {f.label}<span className="vis-filter__count">{counts[f.id]}</span>
        </button>
      ))}
    </div>
  );
}

const matchesVisibility = (record, filter) =>
  filter === "all" ||
  (filter === "active" ? record.status === "active" : record.status !== "active");

function getLeads() {
  try {
    const parsed = JSON.parse(localStorage.getItem("infinityHikers_leads") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const emptyTourForm = {
  destination: "", country: "", dates: "", startDate: "", endDate: "",
  duration: "", durationDays: "", activityType: "cultural",
  category: "tour", scope: "international",
  status: "active", price: "", description: "", highlights: "", includes: "", images: "",
  itinerary: [], excludes: "", paymentSchedule: [], depositNote: "", cancellationPolicy: "",
  groupSize: "", meetingPoint: "", visaNote: "", insuranceNote: "", packingExtras: "",
  flightDistanceKm: "", co2PerPersonTonnes: "",
};

const emptyDay = { title: "", description: "" };
const emptyPaymentRow = { label: "", amount: "", when: "" };

const emptyHeroForm = {
  dest: "", country: "", tagline: "", dateStart: "", dateEnd: "",
  image: "", tourId: "", status: "active",
};

const emptyTestiForm = {
  name: "", avatar: "", rating: "5", destination: "Sri Lanka", text: "",
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { itineraries, updateItinerary, deleteItinerary, addItinerary } = useItineraries();
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const { settings, updateSettings } = useSettings();
  const { pages, updatePage, setFaqs } = useSitePages();
  const { rules, updateRules } = usePricingRules();
  const { slides: heroSlides, addSlide, updateSlide, deleteSlide, moveSlide } = useHeroSlides();
  const {
    categoryOptions, addCategory, renameCategory, removeCategory,
    scopeOptions, addScope, renameScope, removeScope,
  } = useCatalog();
  const {
    navLinks, addNavLink, updateNavLink, removeNavLink, moveNavLink,
    footerLinks, addFooterLink, updateFooterLink, removeFooterLink, moveFooterLink,
  } = useNavLinks();

  const { isAuthed, loading: authLoading, isSupabaseConfigured: supabaseAuthConfigured, signIn, signOut } = useAdminAuth();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [authError, setAuthError]   = useState("");
  const [authBusy, setAuthBusy]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab]   = useState("dashboard");
  const [tourFilter, setTourFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [newScopeLabel, setNewScopeLabel] = useState("");
  const [navTab, setNavTab] = useState("navbar");
  const [newNavLink, setNewNavLink] = useState({ label: "", to: "" });
  const [newFooterLink, setNewFooterLink] = useState({ label: "", to: "" });
  const [heroFilter, setHeroFilter] = useState("all");
  const [notification, setNotification] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [tourLocalPreviews, setTourLocalPreviews] = useState([]);
  const [heroLocalPreview, setHeroLocalPreview] = useState(null);
  // Bumped whenever an upload is cancelled, so a slow/stuck upload that
  // resolves later has its result silently ignored instead of overwriting
  // whatever the admin picked next.
  const heroUploadTokenRef = useRef(0);
  const tourUploadTokenRef = useRef(0);

  // Tour form state
  const [showTourForm, setShowTourForm]   = useState(false);
  const [editingTourId, setEditingTourId] = useState(null);
  const [tourForm, setTourForm]           = useState(emptyTourForm);
  const [modalTab, setModalTab]           = useState("General");

  // Hero slide form state
  const [showHeroForm, setShowHeroForm]   = useState(false);
  const [editingHeroId, setEditingHeroId] = useState(null);
  const [heroForm, setHeroForm]           = useState(emptyHeroForm);
  // Why the last save attempt was refused — pinned inside the modal, because a
  // corner toast next to a still-open modal reads as "the button did nothing"
  const [heroError, setHeroError]         = useState("");

  // Testimonial form state
  const [showTestiForm, setShowTestiForm]   = useState(false);
  const [editingTestiId, setEditingTestiId] = useState(null);
  const [testiForm, setTestiForm]           = useState(emptyTestiForm);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [pagesForm, setPagesForm] = useState(pages);
  const [pagesSaved, setPagesSaved] = useState(false);
  const [pagesTab, setPagesTab] = useState("about");
  const [pricingForm, setPricingForm] = useState(rules);
  const [pricingSaved, setPricingSaved] = useState(false);

  const notify = (msg, { error } = {}) => {
    if (error) console.error(msg);
    setNotification({ msg, error: Boolean(error) });
    setTimeout(() => setNotification(null), error ? 8000 : 3000);
  };

  /* ── Auth ── */
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    const { error } = await signIn(email, password);
    setAuthBusy(false);
    if (error) setAuthError(error);
  };

  /* ── Tour helpers ── */
  // Filtering the list to one category and hitting Add means "add one of these"
  // — starting that form on "Tour" every time is a trap worth avoiding.
  const openNewTour = () => {
    scopeTouchedRef.current = false;
    setEditingTourId(null);
    setTourForm(categoryFilter === "all" ? emptyTourForm : { ...emptyTourForm, category: categoryFilter });
    setModalTab("General");
    setShowTourForm(true);
  };
  const openEditTour = (item) => {
    scopeTouchedRef.current = true; // an existing tour's scope was already chosen once — don't second-guess it
    setEditingTourId(item.id);
    setTourForm({
      destination:  item.destination || "",
      country:      item.country || "",
      dates:        item.dates || "",
      startDate:    item.startDate || "",
      endDate:      item.endDate || "",
      duration:     item.duration || "",
      durationDays: item.durationDays?.toString() || "",
      activityType: item.activityType || "cultural",
      category:     item.category || "tour",
      scope:        item.scope || deriveScope(item.country, item.destination, scopeOptions),
      status:       item.status || "active",
      price:        item.price?.toString() || "",
      description:  item.description || "",
      highlights:   item.highlights?.join("\n") || "",
      includes:     item.includes?.join("\n") || "",
      images:       (Array.isArray(item.gallery) && item.gallery.length ? item.gallery : item.image ? [item.image] : []).join("\n"),
      itinerary:    Array.isArray(item.itinerary) ? item.itinerary.map((d) => ({ title: d.title || "", description: d.description || "" })) : [],
      excludes:     item.excludes?.join("\n") || "",
      paymentSchedule: Array.isArray(item.paymentPlan) ? item.paymentPlan.map((p) => ({ label: p.label || "", amount: p.amount?.toString() || "", when: p.when || "" })) : [],
      depositNote:      item.depositNote || "",
      cancellationPolicy: item.cancellationPolicy || "",
      groupSize:    item.groupSize || "",
      meetingPoint: item.meetingPoint || "",
      visaNote:     item.visaNote || "",
      insuranceNote: item.insuranceNote || "",
      packingExtras: item.packingExtras?.join("\n") || "",
      flightDistanceKm: item.flightDistanceKm?.toString() || "",
      co2PerPersonTonnes: item.co2PerPersonTonnes?.toString() || "",
    });
    setModalTab("General");
    setShowTourForm(true);
  };

  const scopeTouchedRef = useRef(false);
  const handleTourChange = (e) => {
    const { name, value } = e.target;
    if (name === "scope") scopeTouchedRef.current = true;
    setTourForm((p) => {
      const next = { ...p, [name]: value };
      // Moving the start past the end would leave an impossible range behind
      if (name === "startDate" && next.endDate && next.endDate < value) next.endDate = "";
      // Re-suggest scope as the country is typed, until the admin overrides it
      if (name === "country" && !scopeTouchedRef.current) next.scope = deriveScope(value, next.destination, scopeOptions);
      if (name === "destination" && !scopeTouchedRef.current) next.scope = deriveScope(next.country, value, scopeOptions);
      return next;
    });
  };

  /* ── Day-by-Day Plan helpers ── */
  const addDay = () => setTourForm((p) => ({ ...p, itinerary: [...p.itinerary, { ...emptyDay }] }));
  const removeDay = (idx) => setTourForm((p) => ({ ...p, itinerary: p.itinerary.filter((_, i) => i !== idx) }));
  const updateDay = (idx, field, value) => setTourForm((p) => ({
    ...p, itinerary: p.itinerary.map((d, i) => (i === idx ? { ...d, [field]: value } : d)),
  }));
  const moveDay = (idx, dir) => setTourForm((p) => {
    const next = [...p.itinerary];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return p;
    [next[idx], next[target]] = [next[target], next[idx]];
    return { ...p, itinerary: next };
  });

  /* ── Payment Schedule helpers ── */
  const addPaymentRow = () => setTourForm((p) => ({ ...p, paymentSchedule: [...p.paymentSchedule, { ...emptyPaymentRow }] }));
  const removePaymentRow = (idx) => setTourForm((p) => ({ ...p, paymentSchedule: p.paymentSchedule.filter((_, i) => i !== idx) }));
  const updatePaymentRow = (idx, field, value) => setTourForm((p) => ({
    ...p, paymentSchedule: p.paymentSchedule.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
  }));

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      validateFile(file);
    } catch (err) {
      notify(err.message, { error: true });
      return;
    }

    // Instant local preview — shows the exact file picked, before the
    // (possibly slow, possibly failing) upload to Supabase resolves.
    const previewUrl = URL.createObjectURL(file);
    setHeroLocalPreview({ url: previewUrl, name: file.name });
    const token = ++heroUploadTokenRef.current;

    if (!isSupabaseConfigured()) {
      notify("Image upload isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY to .env, or paste an image link instead.", { error: true });
      URL.revokeObjectURL(previewUrl);
      setHeroLocalPreview(null);
      return;
    }

    setUploadingHeroImage(true);
    try {
      const [url] = await uploadImages([file], { folder: "hero" });
      if (heroUploadTokenRef.current !== token) return; // cancelled — ignore this result
      setHeroForm((p) => ({ ...p, image: url }));
      notify(`✅ Uploaded: ${file.name}`);
      setHeroLocalPreview((p) => (p ? { ...p, status: "done" } : p));
      setTimeout(() => {
        if (heroUploadTokenRef.current !== token) return;
        URL.revokeObjectURL(previewUrl);
        setHeroLocalPreview(null);
      }, 1500);
    } catch (err) {
      if (heroUploadTokenRef.current !== token) return;
      notify(err.message || "Image upload failed.", { error: true });
      URL.revokeObjectURL(previewUrl);
      setHeroLocalPreview(null);
    } finally {
      if (heroUploadTokenRef.current === token) setUploadingHeroImage(false);
    }
  };

  const cancelHeroUpload = () => {
    heroUploadTokenRef.current++; // any in-flight result gets ignored when it lands
    if (heroLocalPreview) URL.revokeObjectURL(heroLocalPreview.url);
    setHeroLocalPreview(null);
    setUploadingHeroImage(false);
    notify("Upload cancelled.");
  };

  const removeHeroImage = () => setHeroForm((p) => ({ ...p, image: "" }));

  const handleTourImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file later
    if (!files.length) return;

    try {
      files.forEach(validateFile);
    } catch (err) {
      notify(err.message, { error: true });
      return;
    }

    // Instant local previews — show the exact files picked, before the
    // (possibly slow, possibly failing) upload to Supabase resolves.
    const previews = files.map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setTourLocalPreviews(previews);
    const token = ++tourUploadTokenRef.current;

    if (!isSupabaseConfigured()) {
      notify("Image upload isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY to .env, or paste image links instead.", { error: true });
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setTourLocalPreviews([]);
      return;
    }

    setUploadingImages(true);
    try {
      const urls = await uploadImages(files);
      if (tourUploadTokenRef.current !== token) return; // cancelled — ignore this result
      // Appended after existing links, so an already-first link stays the
      // cover; if the list was empty, the first upload becomes the cover.
      setTourForm((p) => ({
        ...p,
        images: [p.images.trim(), ...urls].filter(Boolean).join("\n"),
      }));
      notify(`✅ Uploaded: ${files.map((f) => f.name).join(", ")}`);
      setTourLocalPreviews((prev) => prev.map((p) => ({ ...p, status: "done" })));
      setTimeout(() => {
        if (tourUploadTokenRef.current !== token) return;
        previews.forEach((p) => URL.revokeObjectURL(p.url));
        setTourLocalPreviews([]);
      }, 1500);
    } catch (err) {
      if (tourUploadTokenRef.current !== token) return;
      notify(err.message || "Image upload failed.", { error: true });
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setTourLocalPreviews([]);
    } finally {
      if (tourUploadTokenRef.current === token) setUploadingImages(false);
    }
  };

  const cancelTourUpload = () => {
    tourUploadTokenRef.current++; // any in-flight result gets ignored when it lands
    tourLocalPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setTourLocalPreviews([]);
    setUploadingImages(false);
    notify("Upload cancelled.");
  };

  const removeTourImage = (idx) => {
    setTourForm((p) => ({
      ...p,
      images: p.images.split(/\r?\n/).filter(Boolean).filter((_, i) => i !== idx).join("\n"),
    }));
  };

  const handleTourSubmit = (e) => {
    e.preventDefault();
    const price = Number(tourForm.price);
    if (!Number.isFinite(price) || price <= 0) {
      notify("Please enter a valid price greater than zero.");
      return;
    }
    if (tourForm.endDate && !tourForm.startDate) {
      notify("Pick a start date before setting an end date.");
      return;
    }
    if (tourForm.startDate && tourForm.endDate && tourForm.endDate < tourForm.startDate) {
      notify("End date must be on or after the start date.");
      return;
    }
    const imageLinks = tourForm.images.split(/\r?\n/).map((link) => link.trim()).filter((link) => /^https?:\/\/\S+$/i.test(link));
    if (tourForm.images.trim() && imageLinks.length === 0) {
      notify("Please add a valid image URL starting with http:// or https://.");
      return;
    }
    const data = {
      ...(imageLinks.length ? { image: imageLinks[0], gallery: imageLinks } : {}),
      destination:  tourForm.destination,
      country:      tourForm.country,
      dates:        tourForm.dates,
      startDate:    tourForm.startDate,
      endDate:      tourForm.endDate,
      duration:     tourForm.duration,
      durationDays: parseInt(tourForm.durationDays) || 0,
      activityType: tourForm.activityType,
      category:     tourForm.category,
      scope:        tourForm.scope,
      status:       tourForm.status,
      price,
      description:  tourForm.description,
      highlights:   tourForm.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      includes:     tourForm.includes.split("\n").map((s) => s.trim()).filter(Boolean),
      excludes:     tourForm.excludes.split("\n").map((s) => s.trim()).filter(Boolean),
      itinerary:    tourForm.itinerary
        .filter((d) => d.title.trim() || d.description.trim())
        .map((d, i) => ({ day: i + 1, title: d.title.trim(), description: d.description.trim() })),
      paymentPlan:  tourForm.paymentSchedule
        .filter((row) => row.label.trim() && Number(row.amount) > 0)
        .map((row) => ({ label: row.label.trim(), amount: Number(row.amount), when: row.when.trim() })),
      depositNote:        tourForm.depositNote.trim(),
      cancellationPolicy: tourForm.cancellationPolicy.trim(),
      groupSize:    tourForm.groupSize.trim(),
      meetingPoint: tourForm.meetingPoint.trim(),
      visaNote:     tourForm.visaNote.trim(),
      insuranceNote: tourForm.insuranceNote.trim(),
      packingExtras: tourForm.packingExtras.split("\n").map((s) => s.trim()).filter(Boolean),
      flightDistanceKm: Number(tourForm.flightDistanceKm) || undefined,
      co2PerPersonTonnes: Number(tourForm.co2PerPersonTonnes) || undefined,
    };
    if (editingTourId) {
      updateItinerary(editingTourId, data);
      notify(`✅ ${data.destination} updated`);
    } else {
      const created = addItinerary({ ...data, id: `${data.destination.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}` });
      // Every field left blank, so the slide mirrors the tour until it is edited.
      // Inactive by default: the admin should approve the banner crop first.
      addSlide({ tourId: created.id, status: "inactive" });
      notify(`✅ ${data.destination} added — a hidden banner picture was created for it`);
    }
    setShowTourForm(false);
  };

  /* ── Hero slide helpers ── */
  // A half-finished upload from the previous slide must not leak into the next
  // form: its preview would sit under a thumbnail that no longer belongs to it,
  // and a stuck "uploading" flag would keep the new form's save button refusing.
  const resetHeroUploadState = () => {
    heroUploadTokenRef.current++;
    if (heroLocalPreview) URL.revokeObjectURL(heroLocalPreview.url);
    setHeroLocalPreview(null);
    setUploadingHeroImage(false);
    setHeroError("");
  };
  const openNewHero = () => { resetHeroUploadState(); setEditingHeroId(null); setHeroForm(emptyHeroForm); setShowHeroForm(true); };
  const openEditHero = (slide) => {
    resetHeroUploadState();
    setEditingHeroId(slide.id);
    setHeroForm({
      dest:    slide.dest || "",
      country: slide.country || "",
      tagline:   slide.tagline || "",
      dateStart: slide.dateStart || "",
      dateEnd:   slide.dateEnd || "",
      image:   slide.image || "",
      tourId:  slide.tourId || "",
      status:  slide.status || "active",
    });
    setShowHeroForm(true);
  };
  const handleHeroChange = (e) => {
    const { name, value } = e.target;
    setHeroForm((p) => {
      const next = { ...p, [name]: value };
      // Moving the start past the end would leave an impossible range behind
      if (name === "dateStart" && next.dateEnd && next.dateEnd < value) next.dateEnd = "";
      return next;
    });
  };
  const handleHeroSubmit = (e) => {
    e.preventDefault();
    const image = heroForm.image.trim();
    const linked = itineraries.find((t) => t.id === heroForm.tourId);
    // Refusing to save has to be as visible as saving: red toast, console entry,
    // and a message that stays put in the modal until the problem is fixed
    const refuse = (msg) => { setHeroError(msg); notify(msg, { error: true }); };
    if (image && !IMAGE_URL_RE.test(image)) {
      refuse("Please add a valid image URL starting with http:// or https://.");
      return;
    }
    if (!image && !linked?.image) {
      refuse("Add an image URL, or link a tour that already has a cover photo.");
      return;
    }
    if (!heroForm.dest.trim() && !linked) {
      refuse("Add a headline, or link a tour to borrow its name.");
      return;
    }
    if (heroForm.dateEnd && !heroForm.dateStart) {
      refuse("Pick a start date before setting an end date.");
      return;
    }
    if (heroForm.dateStart && heroForm.dateStart < todayISO()) {
      refuse("Hero dates cannot be in the past.");
      return;
    }
    if (heroForm.dateStart && heroForm.dateEnd && heroForm.dateEnd < heroForm.dateStart) {
      refuse("Hero end date must be on or after the start date.");
      return;
    }
    setHeroError("");
    const data = {
      ...heroForm,
      image,
      dest: heroForm.dest.trim().toUpperCase(),
      dates: formatHeroDates(heroForm.dateStart, heroForm.dateEnd),
    };
    if (editingHeroId) {
      updateSlide(editingHeroId, data);
      notify(`✅ ${data.dest} banner picture updated`);
    } else {
      addSlide(data);
      notify(`✅ ${data.dest} banner picture added`);
    }
    setShowHeroForm(false);
  };

  /* ── Testimonial helpers ── */
  const openNewTesti = () => { setEditingTestiId(null); setTestiForm(emptyTestiForm); setShowTestiForm(true); };
  const openEditTesti = (t) => {
    setEditingTestiId(t.id);
    setTestiForm({ name: t.name, avatar: t.avatar || "", rating: t.rating?.toString() || "5", destination: t.destination, text: t.text });
    setShowTestiForm(true);
  };
  const handleTestiChange = (e) => setTestiForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleTestiSubmit = (e) => {
    e.preventDefault();

    const data = { ...testiForm, rating: parseInt(testiForm.rating) };
    if (editingTestiId) {
      updateTestimonial(editingTestiId, data);
      notify("✅ Testimonial updated");
    } else {
      addTestimonial(data);
      notify("✅ Testimonial added");
    }
    setShowTestiForm(false);
  };

  /* ── Settings helpers ── */
  const handleSettingsChange = (e) => setSettingsForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSettingsSave = (e) => {
    e.preventDefault();
    const whatsapp = String(settingsForm.whatsapp || "").replace(/\D/g, "");
    if (!/^\d{8,15}$/.test(whatsapp)) {
      notify("Enter a valid WhatsApp number with country code.");
      return;
    }
    updateSettings({ ...settingsForm, whatsapp });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  /* ── Website Pages helpers ── */
  const handlePageTextChange = (page, field, value) =>
    setPagesForm((p) => ({ ...p, [page]: { ...p[page], [field]: value } }));

  const addFaq = () => setPagesForm((p) => ({ ...p, faqs: [...p.faqs, { question: "", answer: "" }] }));
  const removeFaq = (idx) => setPagesForm((p) => ({ ...p, faqs: p.faqs.filter((_, i) => i !== idx) }));
  const updateFaq = (idx, field, value) => setPagesForm((p) => ({
    ...p, faqs: p.faqs.map((f, i) => (i === idx ? { ...f, [field]: value } : f)),
  }));

  const handleSustainTextChange = (field, value) => setPagesForm((p) => ({
    ...p, sustainability: { ...p.sustainability, [field]: value },
  }));
  const addSustainItem = (listKey, emptyItem) => setPagesForm((p) => ({
    ...p, sustainability: { ...p.sustainability, [listKey]: [...p.sustainability[listKey], emptyItem] },
  }));
  const removeSustainItem = (listKey, idx) => setPagesForm((p) => ({
    ...p, sustainability: { ...p.sustainability, [listKey]: p.sustainability[listKey].filter((_, i) => i !== idx) },
  }));
  const updateSustainItem = (listKey, idx, field, value) => setPagesForm((p) => ({
    ...p, sustainability: {
      ...p.sustainability,
      [listKey]: p.sustainability[listKey].map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    },
  }));

  const handlePagesSave = (e) => {
    e.preventDefault();
    updatePage("about", pagesForm.about);
    updatePage("terms", pagesForm.terms);
    updatePage("privacy", pagesForm.privacy);
    updatePage("sustainability", pagesForm.sustainability);
    updatePage("treksIntro", pagesForm.treksIntro);
    updatePage("pilgrimagesIntro", pagesForm.pilgrimagesIntro);
    setFaqs(pagesForm.faqs.filter((f) => f.question.trim() && f.answer.trim()));
    setPagesSaved(true);
    setTimeout(() => setPagesSaved(false), 2500);
  };

  /* ── Trip Calculator (Pricing Rules) helpers ── */
  const addPricingItem = (listKey, emptyItem) => setPricingForm((p) => ({ ...p, [listKey]: [...p[listKey], emptyItem] }));
  const removePricingItem = (listKey, idx) => setPricingForm((p) => ({ ...p, [listKey]: p[listKey].filter((_, i) => i !== idx) }));
  const updatePricingItem = (listKey, idx, field, value) => setPricingForm((p) => ({
    ...p, [listKey]: p[listKey].map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
  }));
  const handlePricingSave = (e) => {
    e.preventDefault();
    updateRules({
      accommodationTiers: pricingForm.accommodationTiers.map((t) => ({ ...t, multiplier: Number(t.multiplier) || 1 })),
      activityAddOns: pricingForm.activityAddOns.map((a) => ({ ...a, cost: Number(a.cost) || 0 })),
      extraAddOns: pricingForm.extraAddOns.map((a) => ({ ...a, cost: Number(a.cost) || 0 })),
      groupDiscountTiers: pricingForm.groupDiscountTiers.map((d) => ({ ...d, minTravelers: Number(d.minTravelers) || 0, discountPercent: Number(d.discountPercent) || 0 })),
    });
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2500);
  };

  /* ── Login screen ── */
  if (authLoading) {
    return <div className="admin-auth-wrapper" />;
  }
  if (!isAuthed) {
    return (
      <div className="admin-auth-wrapper">
        <motion.div className="admin-auth-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="admin-auth-icon">🔐</div>
          <h2>Admin Access</h2>
          <p className="admin-auth-subtitle">{settings.businessName} management panel</p>
          {!supabaseAuthConfigured && (
            <p className="admin-auth-error">
              Admin login isn't set up yet — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env,
              then create the admin account under Supabase → Authentication → Users.
            </p>
          )}
          <form onSubmit={handleAuth}>
            <input className="admin-auth-input" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" autoFocus autoComplete="username" />
            <div className="admin-auth-password-wrap">
              <input className="admin-auth-input" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
              <button
                type="button"
                className="admin-auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {authError && <p className="admin-auth-error">{authError}</p>}
            <button type="submit" className="admin-auth-btn" disabled={authBusy}>
              {authBusy ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <button className="admin-back-btn" onClick={() => navigate("/")}>← Back to Website</button>
        </motion.div>
      </div>
    );
  }

  const activeCount = itineraries.filter((i) => i.status === "active").length;
  const activeHeroCount = heroSlides.filter((s) => s.status === "active").length;
  const today = todayISO();
  const tourMinDate = tourForm.startDate && tourForm.startDate < today ? tourForm.startDate : today;
  const visibleTours = itineraries
    .filter((t) => matchesVisibility(t, tourFilter))
    .filter((t) => categoryFilter === "all" || (t.category || "tour") === categoryFilter)
    .filter((t) => scopeFilter === "all" || (t.scope || "international") === scopeFilter);
  // Drives the section heading and the Add button, so the category you are
  // browsing is the category you create
  const filteredCategoryLabel =
    categoryOptions.find((c) => c.value === categoryFilter)?.label || "Tour";
  const tourIndex = indexToursById(itineraries);
  const heroLinkedTour = tourIndex.get(heroForm.tourId);
  // What the slide will actually render, after inheriting anything left blank
  const heroResolved = resolveHeroSlide(
    { ...heroForm, dates: formatHeroDates(heroForm.dateStart, heroForm.dateEnd) },
    heroLinkedTour
  );

  return (
    <div className="admin-layout">
      {notification && (
        <div className={`admin-notif ${notification.error ? "admin-notif--error" : ""}`}>
          {notification.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">IH</span>
          <span>Admin</span>
        </div>
        <nav className="admin-nav">
          {SIDEBAR.map((item) => (
            <button key={item.id}
              className={`admin-nav__item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="admin-logout-btn" onClick={async () => { await signOut(); navigate("/"); }} title="Sign out">
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="admin-mobile-tabs">
        {SIDEBAR.map((item) => (
          <button
            key={item.id}
            className={`admin-mobile-tab ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main */}
      <main className="admin-main">

        {/* ── Dashboard ── */}
        {activeTab === "dashboard" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Dashboard</h2>
            </div>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <MapPin size={22} className="stat-card__icon" />
                <div>
                  <p className="stat-card__label">Total Tours</p>
                  <h3 className="stat-card__value">{itineraries.length}</h3>
                </div>
              </div>
              <div className="admin-stat-card">
                <Star size={22} className="stat-card__icon" />
                <div>
                  <p className="stat-card__label">Active Tours</p>
                  <h3 className="stat-card__value">{activeCount}</h3>
                </div>
              </div>
              <div className="admin-stat-card">
                <MessageSquare size={22} className="stat-card__icon" />
                <div>
                  <p className="stat-card__label">Testimonials</p>
                  <h3 className="stat-card__value">{testimonials.length}</h3>
                </div>
              </div>
              <div className="admin-stat-card">
                <MessageCircle size={22} className="stat-card__icon" />
                <div>
                  <p className="stat-card__label">Leads</p>
                  <h3 className="stat-card__value">
                    {getLeads().length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="admin-panel-card" style={{ marginTop: "1.5rem" }}>
              <div className="panel-header">
                <h3>All Tours</h3>
                <button className="btn-primary" onClick={() => { setActiveTab("tours"); openNewTour(); }}>
                  <Plus size={14} /> Add Tour
                </button>
              </div>
              <div className="panel-list">
                {itineraries.map((tour) => (
                  <div key={tour.id} className="panel-list-item">
                    <div className="item-details">
                      <h4>{tour.destination}</h4>
                      <p>{tour.dates} · {tour.duration}</p>
                    </div>
                    <div className="item-meta">
                      <span className={`status-badge status-${tour.status}`}>{tour.status}</span>
                      <span className="price">{formatMoney(tour.price, settings.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tours ── */}
        {activeTab === "tours" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>{categoryFilter === "all" ? "Tours" : `${filteredCategoryLabel}s`}</h2>
              <button className="btn-primary" onClick={openNewTour}>
                <Plus size={14} /> Add {filteredCategoryLabel}
              </button>
            </div>
            <p className="admin-section__hint">
              <strong>Hiding</strong> a tour takes it off the website but keeps all its details, so you can
              bring it back any time. <strong>Deleting</strong> removes it for good.
            </p>
            <VisibilityFilter value={tourFilter} onChange={setTourFilter} records={itineraries} />
            <div className="catalog-filter-row">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All trip types</option>
                {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}>
                <option value="all">All regions</option>
                {scopeOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="records-list">
              {visibleTours.length === 0 && (
                <div className="admin-empty"><p>No tours match this filter.</p></div>
              )}
              {visibleTours.map((item) => (
                <div key={item.id} className={`record-card ${item.status === "active" ? "" : "record-card--hidden"}`}>
                  {item.image && (
                    <div className="record-card__img" style={{ backgroundImage: `url(${item.image})` }} />
                  )}
                  <div className="record-info">
                    <div className="record-title-row">
                      <h3>{item.destination}</h3>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status === "active" ? "visible" : "hidden"}
                      </span>
                      <span className="destination-badge">
                        {categoryOptions.find((c) => c.value === item.category)?.label || "Tour"}
                      </span>
                      <span className="destination-badge">
                        {scopeOptions.find((s) => s.value === item.scope)?.label || "International"}
                      </span>
                    </div>
                    <div className="record-meta">
                      {item.dates} · {item.duration} · {formatMoney(item.price, settings.currency)}
                    </div>
                  </div>
                  <div className="record-actions">
                    <button className="icon-btn" onClick={() => openEditTour(item)} title="Edit"><Edit size={15} /></button>
                    <button className="icon-btn btn-danger" onClick={() => {
                      if (window.confirm(`Delete "${item.destination}"?`)) { deleteItinerary(item.id); notify(`🗑️ ${item.destination} deleted`); }
                    }} title="Delete"><Trash2 size={15} /></button>
                    <button
                      className={`btn-toggle ${item.status === "active" ? "btn-toggle--off" : "btn-toggle--on"}`}
                      onClick={() => {
                        const hiding = item.status === "active";
                        updateItinerary(item.id, { status: hiding ? "inactive" : "active" });
                        notify(hiding
                          ? `🙈 ${item.destination} hidden from the website`
                          : `👀 ${item.destination} is live on the website`);
                      }}
                    >
                      {item.status === "active" ? "Hide from site" : "Show on site"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Trip Types & Regions ── */}
        {activeTab === "catalog" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Trip Types & Regions</h2>
            </div>
            <p className="admin-section__hint">
              <strong>Trip type</strong> is what kind of trip it is (Tour, Trek, Pilgrimage…).
              <strong> Region</strong> is roughly where it goes (International, National, Karnataka…).
              You pick both on every trip, and travellers use them as filters while browsing. Renaming
              one here renames it everywhere; you need at least one of each.
            </p>
            <p className="admin-section__hint">
              ℹ️ {ROUTED_CATEGORIES.map((c) => c.label).join(" and ")} have their own page on the website.
              A trip type you add here can be used on trips and as a filter straight away, but its trips
              appear in the main <strong>Destinations</strong> list — giving it a page of its own needs a
              developer.
            </p>

            <div className="catalog-editor">
              <div className="catalog-editor__group">
                <h3>Trip Types</h3>
                {categoryOptions.map((c) => (
                  <div className="catalog-editor__row" key={c.value}>
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => renameCategory(c.value, e.target.value)}
                    />
                    <button
                      type="button"
                      className="icon-btn btn-danger"
                      title="Remove"
                      disabled={categoryOptions.length <= 1}
                      onClick={() => {
                        if (window.confirm(`Remove the trip type "${c.label}"? Trips already using it keep it until you edit and re-save them.`)) {
                          removeCategory(c.value);
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <div className="catalog-editor__add">
                  <input
                    type="text"
                    placeholder="New trip type, e.g. Retreat"
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      if (!newCategoryLabel.trim()) return;
                      addCategory(newCategoryLabel.trim());
                      setNewCategoryLabel("");
                      notify(`✅ Category "${newCategoryLabel.trim()}" added`);
                    }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              <div className="catalog-editor__group">
                <h3>Regions</h3>
                {scopeOptions.map((s) => (
                  <div className="catalog-editor__row" key={s.value}>
                    <input
                      type="text"
                      value={s.label}
                      onChange={(e) => renameScope(s.value, e.target.value)}
                    />
                    <button
                      type="button"
                      className="icon-btn btn-danger"
                      title="Remove"
                      disabled={scopeOptions.length <= 1}
                      onClick={() => {
                        if (window.confirm(`Remove the region "${s.label}"? Trips already using it keep it until you edit and re-save them.`)) {
                          removeScope(s.value);
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <div className="catalog-editor__add">
                  <input
                    type="text"
                    placeholder="New region, e.g. Kerala"
                    value={newScopeLabel}
                    onChange={(e) => setNewScopeLabel(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      if (!newScopeLabel.trim()) return;
                      addScope(newScopeLabel.trim());
                      setNewScopeLabel("");
                      notify(`✅ Scope "${newScopeLabel.trim()}" added`);
                    }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        {activeTab === "navigation" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Navigation</h2>
            </div>
            <p className="admin-section__hint">
              Manage the links shown in the top menu and the footer's "Quick Links" column — add a link
              for any page/route, rename labels, reorder with the arrows, or remove one.
            </p>
            <div className="modal-tabs">
              {[{ id: "navbar", label: "Top Menu" }, { id: "footer", label: "Footer Quick Links" }].map((t) => (
                <button key={t.id} type="button" className={`modal-tab ${navTab === t.id ? "active" : ""}`} onClick={() => setNavTab(t.id)}>{t.label}</button>
              ))}
            </div>

            {navTab === "navbar" && (
              <div className="catalog-editor__group">
                {navLinks.map((link, i) => (
                  <div className="catalog-editor__row" key={i}>
                    <input type="text" placeholder="Label" value={link.label} onChange={(e) => updateNavLink(i, { label: e.target.value })} />
                    <input type="text" placeholder="/path" value={link.to} onChange={(e) => updateNavLink(i, { to: e.target.value })} />
                    <button type="button" className="icon-btn" title="Move up" disabled={i === 0} onClick={() => moveNavLink(i, -1)}><ArrowUp size={15} /></button>
                    <button type="button" className="icon-btn" title="Move down" disabled={i === navLinks.length - 1} onClick={() => moveNavLink(i, 1)}><ArrowDown size={15} /></button>
                    <button type="button" className="icon-btn btn-danger" title="Remove" disabled={navLinks.length <= 1} onClick={() => removeNavLink(i)}><Trash2 size={15} /></button>
                  </div>
                ))}
                <div className="catalog-editor__add">
                  <input type="text" placeholder="Label" value={newNavLink.label} onChange={(e) => setNewNavLink((p) => ({ ...p, label: e.target.value }))} />
                  <input type="text" placeholder="/path" value={newNavLink.to} onChange={(e) => setNewNavLink((p) => ({ ...p, to: e.target.value }))} />
                  <button type="button" className="btn-primary" onClick={() => {
                    if (!newNavLink.label.trim() || !newNavLink.to.trim()) return;
                    addNavLink({ label: newNavLink.label.trim(), to: newNavLink.to.trim() });
                    setNewNavLink({ label: "", to: "" });
                    notify(`✅ "${newNavLink.label.trim()}" added to the top menu`);
                  }}><Plus size={14} /> Add</button>
                </div>
              </div>
            )}

            {navTab === "footer" && (
              <div className="catalog-editor__group">
                {footerLinks.map((link, i) => (
                  <div className="catalog-editor__row" key={i}>
                    <input type="text" placeholder="Label" value={link.label} onChange={(e) => updateFooterLink(i, { label: e.target.value })} />
                    <input type="text" placeholder="/path" value={link.to} onChange={(e) => updateFooterLink(i, { to: e.target.value })} />
                    <button type="button" className="icon-btn" title="Move up" disabled={i === 0} onClick={() => moveFooterLink(i, -1)}><ArrowUp size={15} /></button>
                    <button type="button" className="icon-btn" title="Move down" disabled={i === footerLinks.length - 1} onClick={() => moveFooterLink(i, 1)}><ArrowDown size={15} /></button>
                    <button type="button" className="icon-btn btn-danger" title="Remove" disabled={footerLinks.length <= 1} onClick={() => removeFooterLink(i)}><Trash2 size={15} /></button>
                  </div>
                ))}
                <div className="catalog-editor__add">
                  <input type="text" placeholder="Label" value={newFooterLink.label} onChange={(e) => setNewFooterLink((p) => ({ ...p, label: e.target.value }))} />
                  <input type="text" placeholder="/path" value={newFooterLink.to} onChange={(e) => setNewFooterLink((p) => ({ ...p, to: e.target.value }))} />
                  <button type="button" className="btn-primary" onClick={() => {
                    if (!newFooterLink.label.trim() || !newFooterLink.to.trim()) return;
                    addFooterLink({ label: newFooterLink.label.trim(), to: newFooterLink.to.trim() });
                    setNewFooterLink({ label: "", to: "" });
                    notify(`✅ "${newFooterLink.label.trim()}" added to the footer`);
                  }}><Plus size={14} /> Add</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Homepage Banner ── */}
        {activeTab === "hero" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Homepage Banner</h2>
              <button className="btn-primary" onClick={openNewHero}><Plus size={14} /> Add Banner Picture</button>
            </div>
            <p className="admin-section__hint">
              The big full-screen pictures that slide across the top of your homepage. They play in the
              order listed below — use the ↑ ↓ arrows to change it. Every trip you add starts with a
              hidden banner picture here: check it looks right, then press <strong>Show on homepage</strong>.
              {activeHeroCount === 0 && " ⚠️ Every picture is hidden right now, so the top of your homepage is empty. Press “Show on homepage” on at least one."}
            </p>
            <VisibilityFilter value={heroFilter} onChange={setHeroFilter} records={heroSlides} />
            <div className="records-list">
              {heroSlides.filter((sl) => matchesVisibility(sl, heroFilter)).length === 0 && (
                <div className="admin-empty"><p>No banner pictures match this filter.</p></div>
              )}
              {heroSlides.map((rawSlide, i) => {
                if (!matchesVisibility(rawSlide, heroFilter)) return null;
                const linkedTour = tourIndex.get(rawSlide.tourId);
                const slide = resolveHeroSlide(rawSlide, linkedTour);
                const orphaned = rawSlide.tourId && !linkedTour;
                return (
                <div key={slide.id} className={`record-card ${slide.status === "active" ? "" : "record-card--hidden"}`}>
                  <div className="record-card__img" style={{ backgroundImage: `url(${slide.image})` }} />
                  <div className="record-info">
                    <div className="record-title-row">
                      <h3>{slide.dest || "Untitled banner picture"}</h3>
                      <span className={`status-badge status-${slide.status}`}>
                        {slide.status === "active" ? "visible" : "hidden"}
                      </span>
                      {linkedTour && <span className="destination-badge">{linkedTour.destination}</span>}
                      {orphaned && <span className="status-badge status-inactive">tour deleted</span>}
                    </div>
                    <div className="record-meta">
                      {slide.dates ? `${slide.dates} · ` : ""}{slide.country}{slide.tagline ? ` · ${slide.tagline}` : ""}
                    </div>
                  </div>
                  <div className="record-actions">
                    <button className="icon-btn" disabled={i === 0}
                      onClick={() => moveSlide(slide.id, "up")} title="Move up"><ArrowUp size={15} /></button>
                    <button className="icon-btn" disabled={i === heroSlides.length - 1}
                      onClick={() => moveSlide(slide.id, "down")} title="Move down"><ArrowDown size={15} /></button>
                    <button className="icon-btn" onClick={() => openEditHero(slide)} title="Edit"><Edit size={15} /></button>
                    <button className="icon-btn btn-danger" onClick={() => {
                      if (window.confirm(`Delete the "${slide.dest}" banner picture?`)) { deleteSlide(slide.id); notify(`🗑️ ${slide.dest} banner picture deleted`); }
                    }} title="Delete"><Trash2 size={15} /></button>
                    <button
                      className={`btn-toggle ${slide.status === "active" ? "btn-toggle--off" : "btn-toggle--on"}`}
                      onClick={() => {
                        const hiding = slide.status === "active";
                        updateSlide(slide.id, { status: hiding ? "inactive" : "active" });
                        notify(hiding
                          ? `🙈 ${slide.dest} is no longer on the homepage`
                          : `👀 ${slide.dest} is now showing on the homepage`);
                      }}
                    >
                      {slide.status === "active" ? "Hide from homepage" : "Show on homepage"}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Testimonials ── */}
        {activeTab === "testimonials" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Testimonials</h2>
              <button className="btn-primary" onClick={openNewTesti}><Plus size={14} /> Add</button>
            </div>
            <p className="admin-section__hint">Changes here reflect instantly on the homepage testimonials section.</p>
            <div className="records-list">
              {testimonials.map((t) => (
                <div key={t.id} className="record-card">
                  {t.avatar && <img src={t.avatar} alt={t.name} className="record-card__avatar" />}
                  <div className="record-info">
                    <div className="record-title-row">
                      <h3>{t.name}</h3>
                      <span className="destination-badge">{t.destination}</span>
                      <span className="testi-stars">{"★".repeat(t.rating)}</span>
                    </div>
                    <div className="record-meta">"{t.text}"</div>
                  </div>
                  <div className="record-actions">
                    <button className="icon-btn" onClick={() => openEditTesti(t)}><Edit size={15} /></button>
                    <button className="icon-btn btn-danger" onClick={() => { deleteTestimonial(t.id); notify("🗑️ Testimonial removed"); }}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Website Pages ── */}
        {activeTab === "pages" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Website Pages</h2>
            </div>
            <p className="admin-section__hint">Edit the words shown on the About Us, FAQ, Terms & Conditions and Privacy Policy pages of your website.</p>
            <div className="modal-tabs">
              {[
                { id: "about", label: "About Us" },
                { id: "faq", label: "FAQs" },
                { id: "terms", label: "Terms & Conditions" },
                { id: "privacy", label: "Privacy Policy" },
                { id: "sustainability", label: "Sustainability Page" },
                ...INTRO_PAGE_TABS,
              ].map((t) => (
                <button key={t.id} type="button" className={`modal-tab ${pagesTab === t.id ? "active" : ""}`} onClick={() => setPagesTab(t.id)}>{t.label}</button>
              ))}
            </div>
            <form onSubmit={handlePagesSave} className="settings-form">
              {pagesTab === "about" && (
                <>
                  <div className="settings-group">
                    <label>Page Title</label>
                    <input value={pagesForm.about.heading} onChange={(e) => handlePageTextChange("about", "heading", e.target.value)} />
                  </div>
                  <div className="settings-group">
                    <label>Page Text</label>
                    <textarea rows={10} value={pagesForm.about.body} onChange={(e) => handlePageTextChange("about", "body", e.target.value)} />
                  </div>
                </>
              )}

              {/* Every browse page with a route of its own has the same three
                  intro fields, so they share one editor */}
              {INTRO_PAGE_TABS.map(({ id }) => pagesTab === id && (
                <Fragment key={id}>
                  <div className="settings-group">
                    <label>Small label above the title</label>
                    <input value={pagesForm[id].eyebrow} onChange={(e) => handlePageTextChange(id, "eyebrow", e.target.value)} />
                  </div>
                  <div className="settings-group">
                    <label>Page Title</label>
                    <input value={pagesForm[id].title} onChange={(e) => handlePageTextChange(id, "title", e.target.value)} />
                  </div>
                  <div className="settings-group">
                    <label>Subtitle</label>
                    <input value={pagesForm[id].subtitle} onChange={(e) => handlePageTextChange(id, "subtitle", e.target.value)} />
                  </div>
                </Fragment>
              ))}

              {pagesTab === "faq" && (
                <div className="form-grid form-grid--full">
                  <p className="form-note">Add each question travellers commonly ask, and the answer to show underneath it.</p>
                  {pagesForm.faqs.map((faq, i) => (
                    <div key={i} className="day-card">
                      <div className="day-card__header">
                        <strong>Question {i + 1}</strong>
                        <button type="button" className="icon-btn icon-btn--danger" onClick={() => removeFaq(i)} title="Remove this question"><Trash2 size={15} /></button>
                      </div>
                      <div className="form-group">
                        <label>Question</label>
                        <input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="e.g. How do I book a trip?" />
                      </div>
                      <div className="form-group">
                        <label>Answer</label>
                        <textarea rows={3} value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Write the answer travellers will see..." />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-outline" onClick={addFaq}><Plus size={15} /> Add a Question</button>
                </div>
              )}

              {pagesTab === "terms" && (
                <>
                  <div className="settings-group">
                    <label>Page Title</label>
                    <input value={pagesForm.terms.heading} onChange={(e) => handlePageTextChange("terms", "heading", e.target.value)} />
                  </div>
                  <div className="settings-group">
                    <label>Page Text</label>
                    <textarea rows={10} value={pagesForm.terms.body} onChange={(e) => handlePageTextChange("terms", "body", e.target.value)} />
                  </div>
                </>
              )}

              {pagesTab === "privacy" && (
                <>
                  <div className="settings-group">
                    <label>Page Title</label>
                    <input value={pagesForm.privacy.heading} onChange={(e) => handlePageTextChange("privacy", "heading", e.target.value)} />
                  </div>
                  <div className="settings-group">
                    <label>Page Text</label>
                    <textarea rows={10} value={pagesForm.privacy.body} onChange={(e) => handlePageTextChange("privacy", "body", e.target.value)} />
                  </div>
                </>
              )}

              {pagesTab === "sustainability" && (
                <div className="form-grid form-grid--full">
                  <div className="settings-group">
                    <label>Page Heading</label>
                    <input value={pagesForm.sustainability.heading} onChange={(e) => handleSustainTextChange("heading", e.target.value)} />
                  </div>
                  <div className="settings-group">
                    <label>Page Subtext</label>
                    <input value={pagesForm.sustainability.subheading} onChange={(e) => handleSustainTextChange("subheading", e.target.value)} />
                  </div>
                  <div className="settings-group">
                    <label>Carbon Offset Note</label>
                    <textarea rows={2} value={pagesForm.sustainability.offsetNote} onChange={(e) => handleSustainTextChange("offsetNote", e.target.value)} />
                  </div>

                  <p className="form-note">Responsible Travel Tips</p>
                  {pagesForm.sustainability.tips.map((tip, i) => (
                    <div key={i} className="day-card">
                      <div className="day-card__header">
                        <strong>Tip {i + 1}</strong>
                        <button type="button" className="icon-btn icon-btn--danger" onClick={() => removeSustainItem("tips", i)}><Trash2 size={15} /></button>
                      </div>
                      <div className="form-group"><label>Emoji Icon</label><input value={tip.icon} onChange={(e) => updateSustainItem("tips", i, "icon", e.target.value)} placeholder="🚰" /></div>
                      <div className="form-group"><label>Title</label><input value={tip.title} onChange={(e) => updateSustainItem("tips", i, "title", e.target.value)} /></div>
                      <div className="form-group"><label>Description</label><textarea rows={2} value={tip.desc} onChange={(e) => updateSustainItem("tips", i, "desc", e.target.value)} /></div>
                    </div>
                  ))}
                  <button type="button" className="btn-outline" onClick={() => addSustainItem("tips", { icon: "🌍", title: "", desc: "" })}><Plus size={15} /> Add a Tip</button>

                  <p className="form-note">Conservation Partners</p>
                  {pagesForm.sustainability.partners.map((partner, i) => (
                    <div key={i} className="day-card">
                      <div className="day-card__header">
                        <strong>Partner {i + 1}</strong>
                        <button type="button" className="icon-btn icon-btn--danger" onClick={() => removeSustainItem("partners", i)}><Trash2 size={15} /></button>
                      </div>
                      <div className="form-group"><label>Emoji Icon</label><input value={partner.icon} onChange={(e) => updateSustainItem("partners", i, "icon", e.target.value)} placeholder="🌿" /></div>
                      <div className="form-group"><label>Name</label><input value={partner.name} onChange={(e) => updateSustainItem("partners", i, "name", e.target.value)} /></div>
                      <div className="form-group"><label>What They Do</label><input value={partner.focus} onChange={(e) => updateSustainItem("partners", i, "focus", e.target.value)} /></div>
                    </div>
                  ))}
                  <button type="button" className="btn-outline" onClick={() => addSustainItem("partners", { icon: "🌿", name: "", focus: "" })}><Plus size={15} /> Add a Partner</button>

                  <p className="form-note">Our Green Commitment (shown as 4 boxes at the bottom of the page)</p>
                  {pagesForm.sustainability.commitments.map((c, i) => (
                    <div key={i} className="day-card">
                      <div className="day-card__header">
                        <strong>Commitment {i + 1}</strong>
                        <button type="button" className="icon-btn icon-btn--danger" onClick={() => removeSustainItem("commitments", i)}><Trash2 size={15} /></button>
                      </div>
                      <div className="form-group"><label>Emoji Icon</label><input value={c.icon} onChange={(e) => updateSustainItem("commitments", i, "icon", e.target.value)} placeholder="🏨" /></div>
                      <div className="form-group"><label>Title</label><input value={c.title} onChange={(e) => updateSustainItem("commitments", i, "title", e.target.value)} /></div>
                      <div className="form-group"><label>Description</label><input value={c.desc} onChange={(e) => updateSustainItem("commitments", i, "desc", e.target.value)} /></div>
                    </div>
                  ))}
                  <button type="button" className="btn-outline" onClick={() => addSustainItem("commitments", { icon: "🌍", title: "", desc: "" })}><Plus size={15} /> Add a Commitment</button>
                </div>
              )}

              <button type="submit" className={`btn-primary btn-save ${pagesSaved ? "btn-save--done" : ""}`}>
                <Save size={15} /> {pagesSaved ? "Saved!" : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* ── Trip Calculator Pricing Rules ── */}
        {activeTab === "pricing" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Trip Calculator</h2>
            </div>
            <p className="admin-section__hint">These control the "Trip Calculator" page where visitors estimate their own trip cost — accommodation options, add-ons, and group discounts.</p>
            <form onSubmit={handlePricingSave} className="form-grid form-grid--full">

              <p className="form-note">Accommodation Options (price is a multiplier of the trip's base price, e.g. 1 = same price, 0.85 = 15% cheaper, 1.4 = 40% more)</p>
              {pricingForm.accommodationTiers.map((t, i) => (
                <div key={i} className="day-card">
                  <div className="day-card__header">
                    <strong>Option {i + 1}</strong>
                    <button type="button" className="icon-btn icon-btn--danger" onClick={() => removePricingItem("accommodationTiers", i)}><Trash2 size={15} /></button>
                  </div>
                  <div className="form-group"><label>Emoji Icon</label><input value={t.icon} onChange={(e) => updatePricingItem("accommodationTiers", i, "icon", e.target.value)} /></div>
                  <div className="form-group"><label>Label</label><input value={t.label} onChange={(e) => updatePricingItem("accommodationTiers", i, "label", e.target.value)} placeholder="e.g. Comfort (4-Star)" /></div>
                  <div className="form-group"><label>Price Multiplier</label><input type="number" step="0.05" min="0" value={t.multiplier} onChange={(e) => updatePricingItem("accommodationTiers", i, "multiplier", e.target.value)} /></div>
                </div>
              ))}
              <button type="button" className="btn-outline" onClick={() => addPricingItem("accommodationTiers", { value: `tier-${Date.now()}`, label: "", icon: "🏨", multiplier: 1 })}><Plus size={15} /> Add an Option</button>

              <p className="form-note">Activity Add-Ons (extra cost per traveller)</p>
              {pricingForm.activityAddOns.map((a, i) => (
                <div key={i} className="day-card">
                  <div className="day-card__header">
                    <strong>Add-On {i + 1}</strong>
                    <button type="button" className="icon-btn icon-btn--danger" onClick={() => removePricingItem("activityAddOns", i)}><Trash2 size={15} /></button>
                  </div>
                  <div className="form-group"><label>Emoji Icon</label><input value={a.icon} onChange={(e) => updatePricingItem("activityAddOns", i, "icon", e.target.value)} /></div>
                  <div className="form-group"><label>Label</label><input value={a.label} onChange={(e) => updatePricingItem("activityAddOns", i, "label", e.target.value)} /></div>
                  <div className="form-group"><label>Price per Traveller (₹)</label><input type="number" min="0" value={a.cost} onChange={(e) => updatePricingItem("activityAddOns", i, "cost", e.target.value)} /></div>
                </div>
              ))}
              <button type="button" className="btn-outline" onClick={() => addPricingItem("activityAddOns", { key: `activity-${Date.now()}`, label: "", icon: "✨", cost: 0 })}><Plus size={15} /> Add an Activity</button>

              <p className="form-note">Extra Add-Ons (extra cost per traveller)</p>
              {pricingForm.extraAddOns.map((a, i) => (
                <div key={i} className="day-card">
                  <div className="day-card__header">
                    <strong>Add-On {i + 1}</strong>
                    <button type="button" className="icon-btn icon-btn--danger" onClick={() => removePricingItem("extraAddOns", i)}><Trash2 size={15} /></button>
                  </div>
                  <div className="form-group"><label>Label (include an emoji if you like)</label><input value={a.label} onChange={(e) => updatePricingItem("extraAddOns", i, "label", e.target.value)} placeholder="e.g. 🛡️ Travel Insurance" /></div>
                  <div className="form-group"><label>Price per Traveller (₹)</label><input type="number" min="0" value={a.cost} onChange={(e) => updatePricingItem("extraAddOns", i, "cost", e.target.value)} /></div>
                </div>
              ))}
              <button type="button" className="btn-outline" onClick={() => addPricingItem("extraAddOns", { key: `extra-${Date.now()}`, label: "", cost: 0 })}><Plus size={15} /> Add an Extra</button>

              <p className="form-note">Group Discounts (traveller must meet or exceed the minimum to get that discount)</p>
              {pricingForm.groupDiscountTiers.map((d, i) => (
                <div key={i} className="day-card">
                  <div className="day-card__header">
                    <strong>Discount {i + 1}</strong>
                    <button type="button" className="icon-btn icon-btn--danger" onClick={() => removePricingItem("groupDiscountTiers", i)}><Trash2 size={15} /></button>
                  </div>
                  <div className="form-group"><label>Minimum Number of Travellers</label><input type="number" min="1" value={d.minTravelers} onChange={(e) => updatePricingItem("groupDiscountTiers", i, "minTravelers", e.target.value)} /></div>
                  <div className="form-group"><label>Discount (%)</label><input type="number" min="0" max="100" value={d.discountPercent} onChange={(e) => updatePricingItem("groupDiscountTiers", i, "discountPercent", e.target.value)} /></div>
                </div>
              ))}
              <button type="button" className="btn-outline" onClick={() => addPricingItem("groupDiscountTiers", { minTravelers: 2, discountPercent: 0 })}><Plus size={15} /> Add a Discount Tier</button>

              <button type="submit" className={`btn-primary btn-save ${pricingSaved ? "btn-save--done" : ""}`}>
                <Save size={15} /> {pricingSaved ? "Saved!" : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* ── Settings ── */}
        {activeTab === "settings" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Settings</h2>
            </div>
            <p className="admin-section__hint">All changes are reflected instantly across the website — footer, chatbot, WhatsApp links, and contact details.</p>
            <form onSubmit={handleSettingsSave} className="settings-form">
              <div className="settings-group">
                <label>Business Name</label>
                <input name="businessName" value={settingsForm.businessName}
                  onChange={handleSettingsChange} placeholder="Infinity Pravasa" />
                <span className="settings-hint">Shown in the navbar, footer, page titles, WhatsApp messages and the admin login screen.</span>
              </div>
              <div className="settings-group">
                <label><Phone size={14} /> WhatsApp Number</label>
                <input name="whatsapp" value={settingsForm.whatsapp}
                  onChange={handleSettingsChange} placeholder="919916258596" />
                <span className="settings-hint">Country code + number, no + or spaces. Used in all WhatsApp links.</span>
              </div>
              <div className="settings-group">
                <label><Phone size={14} /> Phone Display</label>
                <input name="phone" value={settingsForm.phone}
                  onChange={handleSettingsChange} placeholder="+91 99162 58596" />
                <span className="settings-hint">Shown in footer and contact sections.</span>
              </div>
              <div className="settings-group">
                <label><Mail size={14} /> Email</label>
                <input name="email" value={settingsForm.email}
                  onChange={handleSettingsChange} type="email" placeholder="infinityhikers@gmail.com" />
              </div>
              <div className="settings-group">
                <label><Instagram size={14} /> Instagram URL</label>
                <input name="instagram" value={settingsForm.instagram}
                  onChange={handleSettingsChange} placeholder="https://www.instagram.com/infinity.hikers" />
              </div>
              <div className="settings-group">
                <label><Star size={14} /> Tagline</label>
                <input name="tagline" value={settingsForm.tagline}
                  onChange={handleSettingsChange} placeholder="482+ adventurers. Zero regrets." />
                <span className="settings-hint">Shown in footer and testimonials section.</span>
              </div>
              <div className="settings-group">
                <label>Currency</label>
                <select name="currency" value={settingsForm.currency} onChange={handleSettingsChange}>
                  {CURRENCY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <span className="settings-hint">Used for every price shown across the website, admin panel, and Trip Calculator.</span>
              </div>
              <div className="settings-group">
                <label>Footer About Text</label>
                <textarea rows={3} name="footerDescription" value={settingsForm.footerDescription}
                  onChange={handleSettingsChange} placeholder="A short line about your business, shown at the bottom of every page." />
                <span className="settings-hint">Shown under your logo in the footer on every page.</span>
              </div>
              <div className="settings-group">
                <label>Footer Bottom Note</label>
                <input name="footerNote" value={settingsForm.footerNote}
                  onChange={handleSettingsChange} placeholder="Made with ♥ for adventure lovers" />
                <span className="settings-hint">Small line shown at the very bottom of every page, next to the copyright.</span>
              </div>
              <button type="submit" className={`btn-primary btn-save ${settingsSaved ? "btn-save--done" : ""}`}>
                <Save size={15} /> {settingsSaved ? "Saved!" : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* ── Leads ── */}
        {activeTab === "leads" && (
          <div className="admin-section">
            <div className="admin-section__header">
              <h2>Leads</h2>
              <button className="btn-outline" onClick={() => {
                if (window.confirm("Clear all leads?")) { localStorage.removeItem("infinityHikers_leads"); notify("🗑️ Leads cleared"); window.location.reload(); }
              }}>Clear All</button>
            </div>
            {(() => {
              const leads = getLeads();
              if (leads.length === 0)
                return <div className="admin-empty"><p>No leads yet. Callback requests from visitors will appear here.</p></div>;
              return (
                <div className="records-list">
                  {leads.map((lead) => (
                    <div key={lead.id} className="record-card">
                      <div className="record-info">
                        <div className="record-title-row">
                          <h3>{lead.name}</h3>
                          <span className="status-badge status-active">new</span>
                        </div>
                        <div className="record-meta">
                          {lead.phone} · {lead.trip || "No trip specified"} · {new Date(lead.createdAt).toLocaleString("en-IN")}
                          {lead.message && <><br />{lead.message}</>}
                        </div>
                      </div>
                      <div className="record-actions">
                        <a className="btn-outline" href={`tel:${lead.phone}`}>Call</a>
                        <a className="btn-primary" href={`https://wa.me/${lead.phone.replace(/\D/g,"")}?text=Hi ${lead.name}, this is ${settings.businessName}!`} target="_blank" rel="noreferrer">WhatsApp</a>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* ── Tour modal ── */}
      <AnimatePresence>
        {showTourForm && (
          <div className="admin-modal-overlay" onClick={() => setShowTourForm(false)}>
            <motion.div className="admin-modal" onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}>
              <div className="modal-header">
                <h2>{editingTourId ? "Edit Tour" : "Add Tour"}</h2>
                <button className="close-btn" onClick={() => setShowTourForm(false)}><X size={18} /></button>
              </div>
              <div className="modal-tabs">
                {MODAL_TABS.map((tab) => (
                  <button key={tab} className={`modal-tab ${modalTab === tab ? "active" : ""}`} onClick={() => setModalTab(tab)}>{tab}</button>
                ))}
              </div>
              <form onSubmit={handleTourSubmit} className="modal-body">

                {modalTab === "General" && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Destination *</label>
                      <input name="destination" value={tourForm.destination} onChange={handleTourChange} required placeholder="e.g. Bali" />
                    </div>
                    <div className="form-group">
                      <label>Country *</label>
                      <input name="country" value={tourForm.country} onChange={handleTourChange} required placeholder="e.g. Indonesia" />
                    </div>
                    <div className="form-group form-group--full">
                      <label>Travel Dates</label>
                      <input name="dates" value={tourForm.dates} onChange={handleTourChange} placeholder="e.g. May 19 - 26, 2026" />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input name="startDate" type="date" value={tourForm.startDate}
                        min={tourMinDate} onChange={handleTourChange} />
                      <p className="form-note">Drives the dd/mm/yyyy dates shown in the trip page's hero.</p>
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input name="endDate" type="date" value={tourForm.endDate}
                        min={tourForm.startDate || tourMinDate}
                        disabled={!tourForm.startDate} onChange={handleTourChange} />
                      {!tourForm.startDate && <p className="form-note">Pick a start date first.</p>}
                    </div>
                    <div className="form-group">
                      <label>Duration Label</label>
                      <input name="duration" value={tourForm.duration} onChange={handleTourChange} placeholder="e.g. 8 Days / 7 Nights" />
                    </div>
                    <div className="form-group">
                      <label>Duration (Days)</label>
                      <input name="durationDays" type="number" min="1" value={tourForm.durationDays} onChange={handleTourChange} placeholder="8" />
                    </div>
                    <div className="form-group">
                      <label>Activity Type</label>
                      <select name="activityType" value={tourForm.activityType} onChange={handleTourChange}>
                        <option value="cultural">Cultural</option>
                        <option value="beach">Beach</option>
                        <option value="trekking">Trekking</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Trip Type</label>
                      <select name="category" value={tourForm.category} onChange={handleTourChange}>
                        {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <p className="form-note">
                        Where it's browsed on the website. {ROUTED_CATEGORIES.map((c) => c.label).join(" and ")} get
                        their own page; everything else is listed under Destinations.
                      </p>
                    </div>
                    <div className="form-group">
                      <label>Region</label>
                      <select name="scope" value={tourForm.scope} onChange={handleTourChange}>
                        {scopeOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <p className="form-note">Guessed from the country you typed — change it any time.</p>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={tourForm.status} onChange={handleTourChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                )}

                {modalTab === "Content" && (
                  <div className="form-grid form-grid--full">
                    <div className="form-group form-group--full">
                      <label>Trip Photos</label>
                      <label className="form-upload-btn form-upload-btn--primary">
                        {uploadingImages ? "Uploading…" : "📤 Upload Photos"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          multiple
                          disabled={uploadingImages}
                          onChange={handleTourImageUpload}
                          hidden
                        />
                      </label>
                      <p className="form-note">
                        Best results: landscape photos at least 1600×1067px (3:2), JPG, PNG, WEBP, or AVIF, up to {MAX_IMAGE_MB}MB each.
                        Uploaded photos are added below in the order chosen — the first one is the trip cover.
                      </p>

                      {tourLocalPreviews.length > 0 && (
                        <div className="image-thumb-row">
                          {tourLocalPreviews.map((p, i) => (
                            <div key={i} className="image-thumb-item">
                              <div className={`image-thumb ${p.status === "done" ? "" : "image-thumb--pending"}`} style={{ backgroundImage: `url(${p.url})` }}>
                                {p.status !== "done" && (
                                  <button type="button" className="image-thumb__remove" title="Cancel upload" onClick={cancelTourUpload}>×</button>
                                )}
                              </div>
                              <span className="image-thumb__name" title={p.name}>{p.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {tourForm.images.split(/\r?\n/).filter(Boolean).length > 0 && (
                        <div className="image-thumb-row">
                          {tourForm.images.split(/\r?\n/).filter(Boolean).map((url, i) => (
                            <div key={i} className="image-thumb-item">
                              <div className="image-thumb" style={{ backgroundImage: `url(${url})` }} title={i === 0 ? "Trip cover" : `Photo ${i + 1}`}>
                                {i === 0 && <span className="image-thumb__cover">Cover</span>}
                                <button type="button" className="image-thumb__remove" title="Remove photo" onClick={() => removeTourImage(i)}>×</button>
                              </div>
                              <span className="image-thumb__name" title={fileNameFromUrl(url)}>{fileNameFromUrl(url)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <details className="form-group__url-fallback" open={tourForm.images.trim().length > 0}>
                        <summary>Or add / edit image links directly</summary>
                        <textarea name="images" rows={4} value={tourForm.images} onChange={handleTourChange} placeholder={"https://images.example.com/cover.jpg\nhttps://images.example.com/gallery-1.jpg"} />
                        <p className="form-note">One direct image URL per line. The first line is the trip cover; every link appears in the website gallery. Reorder lines here to change the cover photo.</p>
                      </details>
                    </div>
                    <div className="form-group form-group--full">
                      <label>Description</label>
                      <textarea name="description" rows={4} value={tourForm.description} onChange={handleTourChange} placeholder="Describe the trip..." />
                    </div>
                    <div className="form-group">
                      <label>Highlights (one per line)</label>
                      <textarea name="highlights" rows={6} value={tourForm.highlights} onChange={handleTourChange} placeholder={"Marina Bay Sands\nGardens by the Bay\nSentosa Island"} />
                    </div>
                    <div className="form-group">
                      <label>What's Included (one per line)</label>
                      <textarea name="includes" rows={6} value={tourForm.includes} onChange={handleTourChange} placeholder={"4 Star Resort\nAll Meals\nFlight & Visa\nA/C Vehicle\nTour Captain"} />
                    </div>
                    <div className="form-group form-group--full">
                      <label>Special Packing Items for This Trip (one per line)</label>
                      <textarea name="packingExtras" rows={4} value={tourForm.packingExtras} onChange={handleTourChange} placeholder={"Sarong for temple visits\nReef-safe sunscreen\nMosquito repellent"} />
                      <p className="form-note">Shown on the Packing List page only when a traveller selects this trip, in addition to the general packing checklist everyone sees.</p>
                    </div>
                  </div>
                )}

                {modalTab === "Day-by-Day Plan" && (
                  <div className="form-grid form-grid--full">
                    <p className="form-note">Add one card per day of the trip. This shows on the trip page under "Day-by-Day Itinerary".</p>
                    {tourForm.itinerary.map((day, i) => (
                      <div key={i} className="day-card">
                        <div className="day-card__header">
                          <strong>Day {i + 1}</strong>
                          <div className="day-card__actions">
                            <button type="button" className="icon-btn" disabled={i === 0} onClick={() => moveDay(i, -1)} title="Move up"><ArrowUp size={15} /></button>
                            <button type="button" className="icon-btn" disabled={i === tourForm.itinerary.length - 1} onClick={() => moveDay(i, 1)} title="Move down"><ArrowDown size={15} /></button>
                            <button type="button" className="icon-btn icon-btn--danger" onClick={() => removeDay(i)} title="Remove this day"><Trash2 size={15} /></button>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>What happens this day (short title)</label>
                          <input value={day.title} onChange={(e) => updateDay(i, "title", e.target.value)} placeholder="e.g. Arrival & Welcome Dinner" />
                        </div>
                        <div className="form-group">
                          <label>Details travellers will read</label>
                          <textarea rows={3} value={day.description} onChange={(e) => updateDay(i, "description", e.target.value)} placeholder="Describe what travellers will do this day..." />
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn-outline" onClick={addDay}><Plus size={15} /> Add a Day</button>
                  </div>
                )}

                {modalTab === "Payment & Rules" && (
                  <div className="form-grid form-grid--full">
                    <div className="form-group form-group--full">
                      <label>What's NOT Included (one per line)</label>
                      <textarea rows={4} name="excludes" value={tourForm.excludes} onChange={handleTourChange} placeholder={"International Flights\nTravel Insurance\nPersonal Expenses"} />
                      <p className="form-note">Shown on the trip page next to "What's Included" so travellers know what they still need to pay for separately.</p>
                    </div>

                    <div className="form-group form-group--full">
                      <label>How Payments Are Collected</label>
                      <p className="form-note">Add each payment step travellers need to pay (e.g. booking amount, then balance closer to the trip).</p>
                      {tourForm.paymentSchedule.map((row, i) => (
                        <div key={i} className="payment-row">
                          <input placeholder="e.g. Booking Amount" value={row.label} onChange={(e) => updatePaymentRow(i, "label", e.target.value)} />
                          <input type="number" min="0" placeholder="Amount (₹)" value={row.amount} onChange={(e) => updatePaymentRow(i, "amount", e.target.value)} />
                          <input placeholder="e.g. 30 days before travel" value={row.when} onChange={(e) => updatePaymentRow(i, "when", e.target.value)} />
                          <button type="button" className="icon-btn icon-btn--danger" onClick={() => removePaymentRow(i)} title="Remove this step"><Trash2 size={15} /></button>
                        </div>
                      ))}
                      <button type="button" className="btn-outline" onClick={addPaymentRow}><Plus size={15} /> Add a Payment Step</button>
                    </div>

                    <div className="form-group form-group--full">
                      <label>Cancellation & Refund Rules</label>
                      <textarea rows={4} name="cancellationPolicy" value={tourForm.cancellationPolicy} onChange={handleTourChange} placeholder="e.g. Full refund if cancelled 30+ days before travel. 50% refund within 15-29 days. No refund within 14 days." />
                      <p className="form-note">Plain-language rules shown to travellers on the trip page — what they get back if they cancel.</p>
                    </div>

                    <div className="form-group">
                      <label>Group Size</label>
                      <input name="groupSize" value={tourForm.groupSize} onChange={handleTourChange} placeholder="e.g. 10 - 25 travellers" />
                    </div>
                    <div className="form-group">
                      <label>Meeting Point / Pickup</label>
                      <input name="meetingPoint" value={tourForm.meetingPoint} onChange={handleTourChange} placeholder="e.g. Bengaluru Airport, Terminal 1" />
                    </div>
                    <div className="form-group">
                      <label>Visa / Passport Note</label>
                      <input name="visaNote" value={tourForm.visaNote} onChange={handleTourChange} placeholder="e.g. Visa on arrival, passport valid 6+ months" />
                    </div>
                    <div className="form-group">
                      <label>Travel Insurance Note</label>
                      <input name="insuranceNote" value={tourForm.insuranceNote} onChange={handleTourChange} placeholder="e.g. Recommended, not included — ask us for options" />
                    </div>
                    <div className="form-group">
                      <label>Round-Trip Flight Distance (km)</label>
                      <input name="flightDistanceKm" type="number" min="0" value={tourForm.flightDistanceKm} onChange={handleTourChange} placeholder="e.g. 1400" />
                      <p className="form-note">Optional — powers the carbon footprint calculator on the Sustainability page. Leave blank to hide it for this trip.</p>
                    </div>
                    <div className="form-group">
                      <label>CO₂ per Traveller (tonnes, round trip)</label>
                      <input name="co2PerPersonTonnes" type="number" min="0" step="0.01" value={tourForm.co2PerPersonTonnes} onChange={handleTourChange} placeholder="e.g. 0.28" />
                    </div>
                  </div>
                )}

                {modalTab === "Pricing" && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Price per Person ({CURRENCY_OPTIONS.find((c) => c.code === settings.currency)?.symbol.trim()}) *</label>
                      <input name="price" type="number" min="0" value={tourForm.price} onChange={handleTourChange} placeholder="54999" required />
                      <p className="form-note">Currency is set once for the whole site under Settings → Currency.</p>
                    </div>
                    {tourForm.price && (
                      <div className="form-group">
                        <label>Preview</label>
                        <div className="price-preview">{formatMoney(tourForm.price, settings.currency)} <span>/person</span></div>
                      </div>
                    )}
                  </div>
                )}

                <div className="modal-footer">
                  <button type="submit" className="btn-primary">{editingTourId ? "Save Changes" : "Add Tour"}</button>
                  <button type="button" className="btn-outline" onClick={() => setShowTourForm(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Hero slide modal ── */}
      <AnimatePresence>
        {showHeroForm && (
          <div className="admin-modal-overlay" onClick={() => setShowHeroForm(false)}>
            <motion.div className="admin-modal admin-modal--sm" onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}>
              <div className="modal-header">
                <h2>{editingHeroId ? "Edit Banner Picture" : "Add Banner Picture"}</h2>
                <button className="close-btn" onClick={() => setShowHeroForm(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleHeroSubmit} className="modal-body">
                <div className="form-grid">
                  <div className="form-group form-group--full">
                    <label>Banner Image{heroLinkedTour?.image ? "" : " *"}</label>
                    <label className="form-upload-btn form-upload-btn--primary">
                      {uploadingHeroImage ? "Uploading…" : "📤 Upload Banner Image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        disabled={uploadingHeroImage}
                        onChange={handleHeroImageUpload}
                        hidden
                      />
                    </label>
                    <p className="form-note">
                      Best results: wide landscape image, at least 1920×1080px (16:9) — it fills the entire screen. JPG, PNG, WEBP, or AVIF, up to {MAX_IMAGE_MB}MB.
                      {heroLinkedTour?.image && " Leave blank and this slide follows the linked tour's cover photo automatically."}
                    </p>
                    {heroLocalPreview && (
                      <div className="image-thumb-item image-thumb-item--lg">
                        <div className={`image-thumb image-thumb--lg ${heroLocalPreview.status === "done" ? "" : "image-thumb--pending"}`} style={{ backgroundImage: `url(${heroLocalPreview.url})` }}>
                          {heroLocalPreview.status !== "done" && (
                            <button type="button" className="image-thumb__remove" title="Cancel upload" onClick={cancelHeroUpload}>×</button>
                          )}
                        </div>
                        <span className="image-thumb__name" title={heroLocalPreview.name}>{heroLocalPreview.name}</span>
                      </div>
                    )}
                    {!heroLocalPreview && heroForm.image.trim() && (
                      <div className="image-thumb-item image-thumb-item--lg">
                        <div className="image-thumb image-thumb--lg" style={{ backgroundImage: `url(${heroForm.image.trim()})` }}>
                          <button type="button" className="image-thumb__remove" title="Remove banner image" onClick={removeHeroImage}>×</button>
                        </div>
                        <span className="image-thumb__name" title={fileNameFromUrl(heroForm.image.trim())}>{fileNameFromUrl(heroForm.image.trim())}</span>
                      </div>
                    )}
                    <details className="form-group__url-fallback" open={heroForm.image.trim().length > 0}>
                      <summary>Or add an image link instead</summary>
                      <input name="image" value={heroForm.image} onChange={handleHeroChange}
                        placeholder={heroLinkedTour?.image ? "Leave blank to use the tour's cover photo" : "https://images.unsplash.com/photo-...?w=1920"} />
                    </details>
                  </div>
                  {IMAGE_URL_RE.test(heroResolved.image.trim()) && (
                    <div className="form-group form-group--full">
                      <label>Preview</label>
                      <div className="hero-preview" style={{ backgroundImage: `url(${heroResolved.image.trim()})` }}>
                        <span className="hero-preview__dest">{heroResolved.dest || "DESTINATION"}</span>
                        {heroResolved.dates && <span className="hero-preview__dates">{heroResolved.dates}</span>}
                        <span className="hero-preview__tagline">{heroResolved.tagline}</span>
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Headline{heroLinkedTour ? "" : " *"}</label>
                    {/* Validated in handleHeroSubmit rather than with `required`: a
                        native bubble on a field scrolled out of view fails silently */}
                    <input name="dest" value={heroForm.dest} onChange={handleHeroChange}
                      placeholder={heroLinkedTour ? heroLinkedTour.destination.toUpperCase() : "BALI"} />
                    <p className="form-note">
                      The giant title. Saved in capitals.
                      {heroLinkedTour && " Blank = the linked tour's name."}
                    </p>
                  </div>
                  <div className="form-group">
                    <label>Subtitle</label>
                    <input name="country" value={heroForm.country} onChange={handleHeroChange}
                      placeholder={heroLinkedTour?.country || "Indonesia"} />
                    {heroLinkedTour && <p className="form-note">Blank = the linked tour's country.</p>}
                  </div>
                  <div className="form-group form-group--full">
                    <label>Tagline</label>
                    <input name="tagline" value={heroForm.tagline} onChange={handleHeroChange}
                      placeholder="Where gods surf and time forgets itself" />
                  </div>
                  <div className="form-group">
                    <label>Show these dates from</label>
                    <input name="dateStart" type="date" value={heroForm.dateStart}
                      min={today} onChange={handleHeroChange} />
                  </div>
                  <div className="form-group">
                    <label>Show these dates until</label>
                    <input name="dateEnd" type="date" value={heroForm.dateEnd}
                      min={heroForm.dateStart || today}
                      disabled={!heroForm.dateStart} onChange={handleHeroChange} />
                    {!heroForm.dateStart && <p className="form-note">Pick a start date first.</p>}
                  </div>
                  <div className="form-group form-group--full">
                    <p className="form-note">
                      {heroResolved.dates
                        ? <>Will show on the banner as <strong>{heroResolved.dates}</strong>. </>
                        : "Pick a start date to show the date pill on this slide. "}
                      <strong>Hero section only</strong> — these dates do not change the linked tour's real
                      travel dates. Edit those under <strong>Tours</strong>.
                      {heroLinkedTour?.dates
                        ? " Leave both blank and the pill follows the linked tour's dates automatically."
                        : " Leave both blank to hide the pill."}
                    </p>
                  </div>
                  <div className="form-group">
                    <label>Which trip does this advertise?</label>
                    <select name="tourId" value={heroForm.tourId} onChange={handleHeroChange}>
                      <option value="">None — hide the View button</option>
                      {itineraries.map((t) => (
                        <option key={t.id} value={t.id}>{t.destination}</option>
                      ))}
                    </select>
                    <p className="form-note">
                      The View button opens this tour, and any field you leave blank above is
                      inherited from it. The button hides itself if the tour is deleted or deactivated.
                    </p>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={heroForm.status} onChange={handleHeroChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                {heroError && <p className="modal-error" role="alert">⚠️ {heroError}</p>}
                <div className="modal-footer">
                  <button type="submit" className="btn-primary">{editingHeroId ? "Save Changes" : "Add Banner Picture"}</button>
                  <button type="button" className="btn-outline" onClick={() => setShowHeroForm(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Testimonial modal ── */}
      <AnimatePresence>
        {showTestiForm && (
          <div className="admin-modal-overlay" onClick={() => setShowTestiForm(false)}>
            <motion.div className="admin-modal admin-modal--sm" onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}>
              <div className="modal-header">
                <h2>{editingTestiId ? "Edit Testimonial" : "Add Testimonial"}</h2>
                <button className="close-btn" onClick={() => setShowTestiForm(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleTestiSubmit} className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input name="name" value={testiForm.name} onChange={handleTestiChange} required placeholder="Priya Sharma" />
                  </div>
                  <div className="form-group">
                    <label>Destination</label>
                    <select name="destination" value={testiForm.destination} onChange={handleTestiChange}>
                      {["Sri Lanka","Bali"].map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rating</label>
                    <select name="rating" value={testiForm.rating} onChange={handleTestiChange}>
                      {[5,4,3].map((r) => <option key={r} value={r}>{r} stars</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Avatar URL</label>
                    <input name="avatar" value={testiForm.avatar} onChange={handleTestiChange} placeholder="https://i.pravatar.cc/80?img=1" />
                  </div>
                  <div className="form-group form-group--full">
                    <label>Review *</label>
                    <textarea name="text" rows={4} value={testiForm.text} onChange={handleTestiChange} required placeholder="What they said about the trip..." />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn-primary">{editingTestiId ? "Save" : "Add"}</button>
                  <button type="button" className="btn-outline" onClick={() => setShowTestiForm(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
