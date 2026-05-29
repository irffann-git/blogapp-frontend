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

// ── category colors ────────────────────────────────────────────────────────
const categoryColors = {
  Technology:   "bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/30",
  Lifestyle:    "bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30",
  Sports:       "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
  Programming:  "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/30",
  Business:     "bg-zinc-400/15 text-zinc-300 ring-1 ring-zinc-400/30",
  Travel:       "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30",
  Health:       "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",
  Productivity: "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-400/30",
  default:      "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30",
};

// ── helper (unchanged) ─────────────────────────────────────────────────────
function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// ── BlogCard ───────────────────────────────────────────────────────────────
function BlogCard({ blog }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const catClass = categoryColors[blog.category] || categoryColors.default;
  const initial = (blog.user?.name?.charAt(0) || "A").toUpperCase();
  const dateStr = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group flex flex-col bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300"
    >
      {/* image */}
      <div className="relative h-44 overflow-hidden bg-zinc-800 shrink-0">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
        <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${catClass}`}>
          {blog.category}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="text-zinc-100 text-[15px] font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {blog.title}
        </h3>
        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 flex-1">
          {blog.description?.slice(0, 110)}…
        </p>
        <div className="flex items-center gap-2 pt-3 mt-auto border-t border-zinc-800/80">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 ring-1 ring-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-200 shrink-0">
            {initial}
          </div>
          <span className="text-zinc-400 text-xs truncate max-w-[100px]">{blog.user?.name || "Anonymous"}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-zinc-600 text-[11px]">👁 {blog.views || 0}</span>
            <span className="text-zinc-700 text-[11px]">·</span>
            <span className="text-zinc-600 text-[11px]">{dateStr}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── TrendingCard (larger featured style) ──────────────────────────────────
function TrendingCard({ blog, rank }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const catClass = categoryColors[blog.category] || categoryColors.default;
  const initial = (blog.user?.name?.charAt(0) || "A").toUpperCase();

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600/80 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 min-h-[280px]"
    >
      {/* bg image */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/70 to-zinc-900/20" />
      </div>

      {/* rank badge */}
      <div className="relative z-10 p-4">
        <span className="text-zinc-700 font-black text-5xl leading-none select-none">
          {String(rank).padStart(2, "0")}
        </span>
      </div>

      {/* content */}
      <div className="relative z-10 mt-auto p-4 flex flex-col gap-2">
        <span className={`self-start text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${catClass}`}>
          {blog.category}
        </span>
        <h3 className="text-white text-base font-bold leading-snug line-clamp-2 group-hover:text-zinc-100 transition-colors">
          {blog.title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 ring-1 ring-zinc-500 flex items-center justify-center text-[9px] font-bold text-zinc-200 shrink-0">
            {initial}
          </div>
          <span className="text-zinc-400 text-xs">{blog.user?.name || "Anonymous"}</span>
          <span className="text-zinc-600 text-xs ml-auto">👁 {blog.views || 0}</span>
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-2 border-t-zinc-300 border-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-t-zinc-500 border-transparent animate-spin [animation-duration:0.6s] [animation-direction:reverse]" />
          </div>
          <p className="text-zinc-600 text-xs tracking-[0.2em] uppercase">Loading stories…</p>
        </div>
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        {/* ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-zinc-700/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-violet-900/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

          {/* eyebrow */}
          <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
            <span className="w-6 h-px bg-zinc-600" />
            <span className="text-zinc-500 text-[11px] tracking-[0.22em] uppercase font-medium">The Digital Journal</span>
          </div>

          {/* heading */}
          <div className="mb-5 text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-100">
              Explore{" "}
              <span className="text-zinc-400">Ideas &</span>
              <br />
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="mt-4 text-zinc-500 text-sm sm:text-base max-w-md leading-relaxed mx-auto sm:mx-0">
              Stories from creative minds around the world — curated for curious readers.
            </p>
          </div>

          {/* search */}
          <div className="relative max-w-lg mb-6 mx-auto sm:mx-0">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search stories, topics, authors…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              maxLength={50}
              className="w-full bg-zinc-900 border border-zinc-700/60 rounded-xl pl-11 pr-10 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* category chips */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-100/10 font-semibold"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Trending ── */}
        {trendingBlogs.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                </div>
                <h2 className="text-zinc-100 text-lg font-bold tracking-tight">Trending Now</h2>
              </div>
              <span className="text-zinc-600 text-xs border border-zinc-800 bg-zinc-900/60 px-3 py-1 rounded-full">
                🔥 most viewed
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingBlogs.map((blog, i) => (
                <TrendingCard key={blog._id} blog={blog} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
          <span className="text-zinc-700 text-[11px] tracking-[0.18em] uppercase font-medium">Latest Stories</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        {/* ── Latest ── */}
        <section>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
              </div>
              <h2 className="text-zinc-100 text-lg font-bold tracking-tight">
                {search ? `Results for "${search}"` : "All Stories"}
              </h2>
              <span className="text-zinc-500 text-xs bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
                {filteredBlogs.length}
              </span>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 px-3 py-1 rounded-lg transition-all"
              >
                Clear search ✕
              </button>
            )}
          </div>

          {/* empty state */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 border border-zinc-800/60 border-dashed rounded-2xl bg-zinc-900/30">
              <div className="w-12 h-12 rounded-full bg-zinc-800/60 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-zinc-300 text-sm font-semibold mb-1">No results found</p>
              <p className="text-zinc-600 text-xs">Try adjusting your search or selecting a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                currentPage === 1
                  ? "text-zinc-700 cursor-not-allowed bg-zinc-900/40 border border-zinc-800/40"
                  : "text-zinc-300 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white shadow-sm"
              }`}
            >
              ← Prev
            </button>

            <div className="flex gap-1.5 flex-wrap justify-center">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                    currentPage === i + 1
                      ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-100/10"
                      : "text-zinc-400 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                currentPage === totalPages
                  ? "text-zinc-700 cursor-not-allowed bg-zinc-900/40 border border-zinc-800/40"
                  : "text-zinc-300 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white shadow-sm"
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