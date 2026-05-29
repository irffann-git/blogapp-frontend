import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

/* ─── tiny helper ────────────────────────────────────────────────────────── */
function buildImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const base =
    import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
  return `${base}/${imagePath.replace(/^\/+/, "")}`;
}

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);   // ← null not ""
  const [previewError, setPreviewError] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });

  /* ── fetch existing blog ─────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get(`/api/blogs/${id}`);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          image: null,
        });

        // FIX: always derive a full URL, then set preview
        const url = buildImageUrl(data.image);
        if (url) {
          setPreview(url);
          setPreviewError(false);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch blog");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  /* ── handlers ────────────────────────────────────────────────────────── */
  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      if (!file) return;
      setFormData((p) => ({ ...p, image: file }));
      setPreview(URL.createObjectURL(file));
      setPreviewError(false);
    } else {
      setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const body = new FormData();
      body.append("title", formData.title);
      body.append("description", formData.description);
      body.append("category", formData.category);
      if (formData.image) body.append("image", formData.image);

      const { data } = await API.put(`/api/blogs/${id}`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(data.message || "Blog updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── loading screen ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E0C0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-amber-900/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-t-2 border-amber-400 animate-spin" />
          </div>
          <p className="text-stone-500 text-xs tracking-widest uppercase animate-pulse">
            Loading post…
          </p>
        </div>
      </div>
    );
  }

  /* ── shared styles ───────────────────────────────────────────────────── */
  const fieldClass =
    "w-full bg-[#17130F] border border-stone-800 rounded-lg px-4 py-3 " +
    "text-stone-100 placeholder-stone-600 text-sm " +
    "focus:outline-none focus:ring-1 focus:ring-amber-500/60 focus:border-amber-500/60 " +
    "transition-colors duration-200";

  const labelClass =
    "block text-[10px] font-bold tracking-widest text-amber-500/80 uppercase mb-2";

  /* ── page ────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0E0C0A] flex items-center justify-center px-4 py-12">

      {/* ambient glow behind card */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-900/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-amber-800/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-2xl">

        {/* thin amber top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mb-px rounded-full" />

        <div className="bg-[#13110E] border border-stone-800/70 rounded-2xl overflow-hidden shadow-2xl">

          {/* ── header ─────────────────────────────────────────── */}
          <div className="relative px-6 sm:px-10 pt-8 pb-7 border-b border-stone-800/60">
            {/* decorative left bar */}
            <span className="absolute left-0 top-8 bottom-7 w-0.5 bg-gradient-to-b from-amber-500 to-amber-700 rounded-r-full" />

            <p className="text-[10px] font-bold tracking-widest text-amber-500 uppercase mb-2">
              ✦ Edit post
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 leading-tight">
              Update your story
            </h1>
            <p className="text-stone-500 text-xs mt-1.5">
              Refine, rewrite, republish — make it perfect.
            </p>
          </div>

          {/* ── form ───────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-7">

            {/* title */}
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                name="title"
                placeholder="Give your post a compelling title…"
                className={fieldClass}
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* description */}
            <div>
              <label className={labelClass}>Content</label>
              <textarea
                name="description"
                placeholder="Tell your story here…"
                rows={8}
                className={`${fieldClass} resize-none leading-relaxed`}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* category */}
            <div>
              <label className={labelClass}>Category</label>
              <input
                type="text"
                name="category"
                placeholder="e.g. Technology · Travel · Health"
                className={fieldClass}
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            {/* ── cover image ──────────────────────────────────── */}
            <div>
              <label className={labelClass}>Cover image</label>

              {/* upload zone */}
              <label className="group flex items-center gap-3 cursor-pointer w-full bg-[#17130F] border border-dashed border-stone-700 hover:border-amber-500/50 rounded-lg px-4 py-4 transition-colors duration-200">
                <svg
                  className="w-5 h-5 text-stone-600 group-hover:text-amber-500 transition-colors flex-shrink-0"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-stone-500 group-hover:text-stone-400 transition-colors truncate">
                  {formData.image
                    ? formData.image.name
                    : "Click to replace cover image  (optional)"}
                </span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>

              {/* ── preview ── THE FIX IS HERE ────────────────── */}
              {preview && (
                <div className="mt-4 relative rounded-xl overflow-hidden border border-stone-800">
                  {previewError ? (
                    /* graceful fallback when URL 404s */
                    <div className="w-full h-48 flex flex-col items-center justify-center bg-stone-900 text-stone-600 gap-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                          d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs">Could not load current image</p>
                    </div>
                  ) : (
                    <img
                      key={preview}          /* force re-mount on URL change */
                      src={preview}
                      alt="Cover preview"
                      onError={() => setPreviewError(true)}
                      className="w-full h-52 sm:h-64 object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] text-stone-400 bg-black/60 px-2 py-0.5 rounded-full">
                    {formData.image ? "New image selected" : "Current cover"}
                  </span>
                </div>
              )}
            </div>

            {/* divider */}
            <div className="border-t border-stone-800/60" />

            {/* buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="sm:flex-1 bg-stone-800/60 hover:bg-stone-700/60 text-stone-400 hover:text-stone-300 font-semibold py-3 rounded-xl text-sm transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="sm:flex-1 relative overflow-hidden bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-900 font-bold py-3 rounded-xl text-sm transition-colors duration-200"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                    Saving…
                  </span>
                ) : "Save changes"}
              </button>
            </div>

          </form>
        </div>

        {/* bottom thin accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent mt-px rounded-full" />
      </div>
    </div>
  );
}