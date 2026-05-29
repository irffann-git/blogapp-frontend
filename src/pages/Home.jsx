import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

// ── debounce hook (unchanged) ──────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── category config ────────────────────────────────────────────────────────
const categoryColors = {
  Technology:   "bg-indigo-100 text-indigo-800",
  Lifestyle:    "bg-amber-100 text-amber-800",
  Sports:       "bg-emerald-100 text-emerald-800",
  Programming:  "bg-violet-100 text-violet-800",
  Business:     "bg-stone-100 text-stone-700",
  Travel:       "bg-sky-100 text-sky-800",
  Health:       "bg-rose-100 text-rose-800",
  Productivity: "bg-lime-100 text-lime-800",
  default:      "bg-gray-100 text-gray-700",
};

// ── helper (unchanged) ─────────────────────────────────────────────────────
function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// ── BlogCard ───────────────────────────────────────────────────────────────
function BlogCard({ blog, featured = false }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const catClass = categoryColors[blog.category] || categoryColors.default;
  const initial = (blog.user?.name?.charAt(0) || "A").toUpperCase();
  const dateStr = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  if (featured) {
    return (
      <Link
        to={`/blogs/${blog._id}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl min-h-[360px] bg-neutral-900 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
      >
        {/* image */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        </div>

        {/* content */}
        <div className="relative z-10 mt-auto p-5 flex flex-col gap-2">
          <span className={`self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow ${catClass}`}>
            {blog.category}
          </span>
          <h3 className="font-serif text-white text-xl sm:text-2xl font-bold italic leading-snug line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-white/55 text-xs font-light line-clamp-2 leading-relaxed">
            {blog.description?.slice(0, 130)}…
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-[10px] font-bold text-neutral-900">
              {initial}
            </div>
            <span className="text-white/60 text-xs truncate max-w-[100px]">{blog.user?.name || "Anonymous"}</span>
            <span className="text-white/30 text-[10px]">·</span>
            <span className="text-white/50 text-xs">👁 {blog.views || 0}</span>
            <span className="text-white/30 text-[10px]">·</span>
            <span className="text-white/50 text-xs">{dateStr}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-amber-200 transition-all duration-300"
    >
      {/* image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow ${catClass}`}>
          {blog.category}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-serif text-neutral-900 font-bold italic text-base leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors duration-200">
          {blog.title}
        </h3>
        <p className="text-gray-500 text-xs font-light leading-relaxed line-clamp-3 flex-1">
          {blog.description?.slice(0, 110)}…
        </p>
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-[10px] font-bold text-neutral-900 shrink-0">
            {initial}
          </div>
          <span className="text-gray-500 text-xs truncate max-w-[100px]">{blog.user?.name || "Anonymous"}</span>
          <span className="text-gray-300 text-xs ml-auto">👁 {blog.views || 0}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Home ───────────────────────────────────────────────────────────────────
function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const blogsPerPage = 12;
  const debouncedSearch = useDebounce(search, 500);

  const categories = [
    "All", "Technology", "Lifestyle", "Sports", "Programming",
    "Business", "Travel", "Health", "Productivity",
  ];

  // ✅ fetch logic unchanged
  useEffect(() => {
    const controller = new AbortController();
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(
          `/api/blogs?search=${encodeURIComponent(debouncedSearch)}`,
          { signal: controller.signal }
        );
        setBlogs(data);
      } catch (error) {
        if (error.name === "AbortError" || error.name === "CanceledError") return;
        console.log(error);
        toast.error("Failed to fetch blogs");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
    return () => controller.abort();
  }, [debouncedSearch]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-2 border-amber-800/40 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-amber-400 border-transparent rounded-full animate-spin" />
          <div className="absolute inset-[8px] border-2 border-t-amber-300 border-transparent rounded-full animate-spin [animation-duration:0.7s] [animation-direction:reverse]" />
        </div>
        <p className="text-neutral-500 text-sm tracking-widest font-light">Curating stories…</p>
      </div>
    );
  }

  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === selectedCategory);

  const trendingBlogs = [...blogs].sort((a, b) => b.views - a.views).slice(0, 3);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  return (
    <div className="min-h-screen bg-stone-50 font-sans">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <header className="relative bg-neutral-950 overflow-hidden">
        {/* decorative glows */}
        <div className="absolute -top-40 -right-20 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] bg-amber-600/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-20 sm:pb-14 text-center">

          {/* eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block w-8 h-px bg-amber-700/60" />
            <span className="text-amber-500 text-[10px] font-semibold tracking-[0.25em] uppercase">The Digital Journal</span>
            <span className="block w-8 h-px bg-amber-700/60" />
          </div>

          {/* heading */}
          <h1 className="mb-5 leading-tight tracking-tight">
            <span className="block font-serif italic font-bold text-white text-4xl sm:text-5xl lg:text-6xl">
              Ideas Worth
            </span>
            <span
              className="block font-serif font-black text-transparent text-5xl sm:text-6xl lg:text-7xl tracking-wide"
              style={{ WebkitTextStroke: "2px #a0722a" }}
            >
              Reading
            </span>
          </h1>

          <p className="text-neutral-400 font-light text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
            Stories from creative minds around the world — curated for curious readers.
          </p>

          {/* search */}
          <div className="relative max-w-xl mx-auto mb-7">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search stories, topics, authors…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              maxLength={50}
              className="w-full pl-10 pr-10 py-3.5 rounded-full bg-white/6 border border-white/10 text-white placeholder-neutral-500 text-sm font-light focus:outline-none focus:border-amber-600/50 focus:bg-white/9 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-amber-400 text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-neutral-900 font-semibold shadow-md"
                    : "bg-white/6 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* bottom rule */}
        <div className="relative z-10 h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent" />
      </header>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* ── Trending ── */}
        {trendingBlogs.length > 0 && (
          <section className="mb-14">
            {/* section header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <h2 className="font-serif italic font-bold text-neutral-900 text-2xl sm:text-3xl">Trending Now</h2>
              </div>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                Most Viewed
              </span>
            </div>

            {/* featured grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingBlogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} featured={i === 0} />
              ))}
            </div>
          </section>
        )}

        {/* ── Ornamental divider ── */}
        <div className="flex items-center gap-4 mb-12 opacity-40">
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <span className="text-amber-700 text-xs">✦</span>
          <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>

        {/* ── Latest Stories ── */}
        <section>
          {/* section header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
            <h2 className="font-serif italic font-bold text-neutral-900 text-2xl sm:text-3xl">
              {search ? `Results for "${search}"` : "Latest Stories"}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                {filteredBlogs.length} article{filteredBlogs.length !== 1 && "s"}
              </span>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-amber-700 hover:text-amber-500 font-medium transition-colors"
                >
                  Clear ✕
                </button>
              )}
            </div>
          </div>

          {/* empty state */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-4xl text-gray-200 mb-3">◎</p>
              <p className="font-serif italic font-bold text-neutral-700 text-xl mb-1">Nothing found</p>
              <p className="text-gray-400 text-sm font-light">Try a different search term or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          )}
        </section>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 shadow-sm"
              }`}
            >
              ← Prev
            </button>

            <div className="flex gap-1.5 flex-wrap justify-center">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    currentPage === i + 1
                      ? "bg-neutral-900 text-amber-400 shadow-md"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 shadow-sm"
              }`}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;