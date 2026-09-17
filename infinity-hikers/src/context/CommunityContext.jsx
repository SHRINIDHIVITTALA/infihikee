import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// Seeded with exactly what was previously hardcoded in Community.jsx, so
// nothing changes visually the moment this ships — it just becomes editable.
// See MOCK_DATA_AUDIT.md.
const DEFAULT_PHOTOS = [
  { id: "p1", src: "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800", destination: "Sri Lanka", author: "Priya M.", caption: "Bentota Beach at sunset — magical!", likes: 124, featured: true },
  { id: "p2", src: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=800", destination: "Sri Lanka", author: "Rahul K.", caption: "Madu River safari was worth every moment", likes: 89, featured: false },
  { id: "p3", src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800", destination: "Bali", author: "Arjun D.", caption: "Tegallalang rice terraces", likes: 201, featured: true },
  { id: "p4", src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800", destination: "Bali", author: "Ananya R.", caption: "Temple ceremony at Tanah Lot", likes: 98, featured: false },
  { id: "p5", src: "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800", destination: "Sri Lanka", author: "Varun G.", caption: "Colombo after dark", likes: 178, featured: false },
  { id: "p6", src: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=800", destination: "Sri Lanka", author: "Diya N.", caption: "Kandy temple visit in the morning", likes: 112, featured: false },
  { id: "p7", src: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800", destination: "Bali", author: "Riya L.", caption: "Sunrise at Mount Batur", likes: 230, featured: true },
];

const DEFAULT_POSTS = [
  { id: "r1", title: "6 Days in Sri Lanka: A Group Traveler's Dream", author: "Priya Menon", avatar: "https://i.pravatar.cc/80?img=25", date: "Feb 2026", destination: "Sri Lanka", excerpt: "I was nervous about my first group trip, but the Infinity Pravasa team made it unforgettable. From Bentota Beach to the scenic coastal train journey, every moment was curated to perfection.", readTime: "5 min read", likes: 47, image: "https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=900" },
  { id: "r2", title: "Sri Lanka: Beaches, Tea Country & Culture", author: "Rahul Krishnamurthy", avatar: "https://i.pravatar.cc/80?img=12", date: "Apr 2025", destination: "Sri Lanka", excerpt: "From the Madu River safari to the Temple of the Tooth and tea-covered hills of Nuwara Eliya, every day felt like a new discovery. Sri Lanka is a destination full of warmth and wonder.", readTime: "8 min read", likes: 82, image: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=900" },
  { id: "r3", title: "Bali: Beyond the Instagram Clichés", author: "Arjun Deshmukh", avatar: "https://i.pravatar.cc/80?img=18", date: "Dec 2025", destination: "Bali", excerpt: "Yes, the rice terraces are stunning. But the real Bali magic? It's in the temple ceremonies at dawn, the conversations with local artisans, and the sunrises from Mount Batur that make you question why you ever hit snooze.", readTime: "7 min read", likes: 104, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900" },
];

const CommunityContext = createContext();

function rowToPhoto(row) {
  return { id: row.id, src: row.src, destination: row.destination, author: row.author, caption: row.caption, likes: row.likes, featured: row.featured };
}
function photoToRow(p) {
  const row = {};
  const set = (col, val) => { if (val !== undefined) row[col] = val; };
  set("id", p.id); set("src", p.src); set("destination", p.destination);
  set("author", p.author); set("caption", p.caption); set("likes", p.likes); set("featured", p.featured);
  return row;
}

function rowToPost(row) {
  return { id: row.id, title: row.title, author: row.author, avatar: row.avatar, date: row.date_label, destination: row.destination, excerpt: row.excerpt, readTime: row.read_time, likes: row.likes, image: row.image };
}
function postToRow(p) {
  const row = {};
  const set = (col, val) => { if (val !== undefined) row[col] = val; };
  set("id", p.id); set("title", p.title); set("author", p.author); set("avatar", p.avatar);
  set("date_label", p.date); set("destination", p.destination); set("excerpt", p.excerpt);
  set("read_time", p.readTime); set("likes", p.likes); set("image", p.image);
  return row;
}

export function CommunityProvider({ children }) {
  const [photos, setPhotos] = useState(DEFAULT_PHOTOS);
  const [posts, setPosts] = useState(DEFAULT_POSTS);
  const mutatedRef = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    Promise.all([
      supabase.from("community_photos").select("*").order("sort_order", { ascending: true }),
      supabase.from("community_posts").select("*").order("sort_order", { ascending: true }),
    ]).then(([photosRes, postsRes]) => {
      if (cancelled || mutatedRef.current) return;
      if (photosRes.error) {
        console.warn("Could not load community photos from Supabase (has migration 0006_community.sql been run?), showing built-in defaults:", photosRes.error.message);
      } else if (photosRes.data?.length) {
        setPhotos(photosRes.data.map(rowToPhoto));
      }
      if (postsRes.error) {
        console.warn("Could not load community trip reports from Supabase, showing built-in defaults:", postsRes.error.message);
      } else if (postsRes.data?.length) {
        setPosts(postsRes.data.map(rowToPost));
      }
    });
    return () => { cancelled = true; };
  }, []);

  const requireConfigured = () => {
    mutatedRef.current = true;
    if (!isSupabaseConfigured()) {
      throw new Error("Saving isn't set up yet — add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in .env.");
    }
  };

  const addPhoto = async (photo) => {
    requireConfigured();
    const nextOrder = photos.length ? Math.max(...photos.map((_, i) => i)) + 1 : 0;
    const newPhoto = { ...photo, id: photo.id || `photo-${Date.now()}` };
    const { error } = await supabase.from("community_photos").insert({ ...photoToRow(newPhoto), sort_order: nextOrder });
    if (error) throw new Error(`Couldn't save the photo: ${error.message}`);
    setPhotos((prev) => [...prev, newPhoto]);
    return newPhoto;
  };
  const updatePhoto = async (id, updates) => {
    requireConfigured();
    const { error } = await supabase.from("community_photos").update(photoToRow(updates)).eq("id", id);
    if (error) throw new Error(`Couldn't save changes: ${error.message}`);
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };
  const deletePhoto = async (id) => {
    requireConfigured();
    const { error } = await supabase.from("community_photos").delete().eq("id", id);
    if (error) throw new Error(`Couldn't delete: ${error.message}`);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const addPost = async (post) => {
    requireConfigured();
    const nextOrder = posts.length ? Math.max(...posts.map((_, i) => i)) + 1 : 0;
    const newPost = { ...post, id: post.id || `post-${Date.now()}` };
    const { error } = await supabase.from("community_posts").insert({ ...postToRow(newPost), sort_order: nextOrder });
    if (error) throw new Error(`Couldn't save the trip report: ${error.message}`);
    setPosts((prev) => [...prev, newPost]);
    return newPost;
  };
  const updatePost = async (id, updates) => {
    requireConfigured();
    const { error } = await supabase.from("community_posts").update(postToRow(updates)).eq("id", id);
    if (error) throw new Error(`Couldn't save changes: ${error.message}`);
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };
  const deletePost = async (id) => {
    requireConfigured();
    const { error } = await supabase.from("community_posts").delete().eq("id", id);
    if (error) throw new Error(`Couldn't delete: ${error.message}`);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <CommunityContext.Provider
      value={{ photos, addPhoto, updatePhoto, deletePhoto, posts, addPost, updatePost, deletePost }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
