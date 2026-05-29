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
  Technology:   "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
  Lifestyle:    "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20",
  Sports:       "bg-green-500/10 text-green-400 ring-1 ring-green-500/20",
  Programming:  "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20",
  Business:     "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20",
  Travel:       "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20",
  Health:       "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20",
  Productivity: "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20",
  default:      "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20",
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
    month: "short", day: "numeric",
  });

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 hover:bg-zinc-800/60 transition-all duration-200"
    >
      {/* image */}
      <div className="relative h-40 overflow-hidden bg-zinc-800 shrink-0">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-md ${catClass}`}>
          {blog.category}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <h3 className="text-zinc-100 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {blog.title}
        </h3>
        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 flex-1">
          {blog.description?.slice(0, 100)}…
        </p>
        <div className="flex items-center gap-2 pt-2 mt-auto border-t border-zinc-800">
          <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-300 shrink-0">
            {initial}
          </div>
          <span className="text-zinc-500 text-[11px] truncate max-w-[90px]">{blog.user?.name || "Anonymous"}</span>
          <span className="text-zinc-600 text-[11px] ml-auto">{dateStr}</span>
          <span className="text-zinc-600 text-[11px]">· {blog.views || 0} views</span>
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

  // fetch logic unchanged
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          <p className="text-zinc-600 text-xs tracking-widest">loading…</p>
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
      <div className="border-b border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          {/* title row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
            <div>
              <p className="text-zinc-600 text-[11px] tracking-[0.2em] uppercase font-medium mb-2">
                — The Digital Journal
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight leading-tight">
                Explore Ideas &{" "}
                <span className="text-zinc-500">Insights</span>
              </h1>
            </div>
            <p className="text-zinc-600 text-xs max-w-xs leading-relaxed sm:text-right">
              Stories from creative minds around the world, curated for curious readers.
            </p>
          </div>

          {/* search */}
          <div className="relative mb-5">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search stories…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              maxLength={50}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-8 py-2.5 text-zinc-300 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-600 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* category chips */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
                  selectedCategory === cat
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* ── Trending ── */}
        {trendingBlogs.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-zinc-500 rounded-full inline-block" />
                <h2 className="text-zinc-300 text-sm font-semibold tracking-tight">Trending</h2>
              </div>
              <span className="text-zinc-600 text-[11px]">top by views</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trendingBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          </section>
        )}

        {/* divider */}
        <div className="flex items-center gap-3 mb-8">
          <span className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-700 text-[10px] tracking-widest uppercase">latest</span>
          <span className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* ── Latest ── */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-zinc-500 rounded-full inline-block" />
              <h2 className="text-zinc-300 text-sm font-semibold tracking-tight">
                {search ? `"${search}"` : "Stories"}
              </h2>
              <span className="text-zinc-700 text-[11px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                {filteredBlogs.length}
              </span>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                clear ✕
              </button>
            )}
          </div>

          {/* empty */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16 border border-zinc-800 border-dashed rounded-xl">
              <p className="text-zinc-700 text-2xl mb-2">○</p>
              <p className="text-zinc-500 text-sm">No results found</p>
              <p className="text-zinc-700 text-xs mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          )}
        </section>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-10 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentPage === 1
                  ? "text-zinc-700 cursor-not-allowed"
                  : "text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 bg-zinc-900"
              }`}
            >
              ← prev
            </button>

            <div className="flex gap-1 flex-wrap justify-center">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    currentPage === i + 1
                      ? "bg-zinc-100 text-zinc-900 font-bold"
                      : "text-zinc-500 border border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentPage === totalPages
                  ? "text-zinc-700 cursor-not-allowed"
                  : "text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 bg-zinc-900"
              }`}
            >
              next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;