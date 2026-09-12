import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "tour_images";

// Assumption: 8MB cap, picked from the user's "5 to 10MB" range as a
// reasonable middle ground between photo quality and upload/storage cost.
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export { isSupabaseConfigured };

export function validateFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(`${file.name}: unsupported file type (use JPG, PNG, WEBP, or AVIF).`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${file.name}: file is larger than ${MAX_IMAGE_MB}MB.`);
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Uploads a single File to Supabase Storage and returns its public URL.
// Throws if Supabase isn't configured (credentials pending) or the file
// fails validation/upload.
//
// The bucket's only working RLS policies grant access scoped to the
// top-level folder "1ibxcu7" (Supabase's folder policies only check the
// first path segment), so every upload path must start with that segment
// until the RLS policies are widened to cover the whole bucket.
export async function uploadImage(file, { folder = "1ibxcu7/tours" } = {}) {
  validateFile(file);
  if (!supabase) {
    throw new Error(
      "Image upload isn't configured yet — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable direct uploads."
    );
  }

  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${slugify(file.name)}.${ext}`;

  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Uploads multiple files sequentially, returning URLs in the same order the
// files were selected (order matters — the caller treats index 0 as cover
// when the destination list was previously empty).
export async function uploadImages(files, options) {
  const urls = [];
  for (const file of files) {
    urls.push(await uploadImage(file, options));
  }
  return urls;
}
