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
  Technology:   "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
  Lifestyle:    "bg-orange-50 text-orange-600 ring-1 ring-orange-100",
  Sports:       "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  Programming:  "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
  Business:     "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
  Travel:       "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100",
  Health:       "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
  Productivity: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  default:      "bg-gray-50 text-gray-600 ring-1 ring-gray-200",
};

const categoryDots = {
  Technology: "bg-blue-500",
  Lifestyle: "bg-orange-500",
  Sports: "bg-emerald-500",
  Programming: "bg-violet-500",
  Business: "bg-slate-500",
  Travel: "bg-cyan-500",
  Health: "bg-rose-500",
  Productivity: "bg-amber-500",
  default: "bg-gray-400",
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
  const dotClass = categoryDots[blog.category] || categoryDots.default;
  const dateStr = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${catClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
          {blog.category}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-gray-900 text-[15px] font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {blog.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
          {blog.description?.slice(0, 110)}…
        </p>
        <div className="flex items-center gap-2.5 pt-4 border-t border-gray-100">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-gray-700 text-xs font-medium truncate">{blog.user?.name || "Anonymous"}</span>
            <span className="text-gray-400 text-[11px]">{dateStr}</span>
          </div>
          <span className="text-gray-400 text-xs ml-auto flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {blog.views || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── TrendingCard ───────────────────────────────────────────────────────────
function TrendingCard({ blog, rank }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const catClass = categoryColors[blog.category] || categoryColors.default;
  const initial = (blog.user?.name?.charAt(0) || "A").toUpperCase();

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-h-[260px] bg-gray-900"
    >
      <div className="absolute inset-0">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
      </div>

      {/* rank */}
      <div className="relative z-10 p-4 flex justify-between items-start">
        <span className="text-white/20 font-black text-6xl leading-none select-none">
          {String(rank).padStart(2, "0")}
        </span>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${catClass}`}>
          {blog.category}
        </span>
      </div>

      {/* content */}
      <div className="relative z-10 mt-auto p-4 flex flex-col gap-2.5">
        <h3 className="text-white text-base font-bold leading-snug line-clamp-2">
          {blog.title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {initial}
          </div>
          <span className="text-white/70 text-xs">{blog.user?.name || "Anonymous"}</span>
          <span className="text-white/40 text-xs ml-auto flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {blog.views || 0}
          </span>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-transparent animate-spin" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Loading stories…</p>
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
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

          {/* heading block */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full ring-1 ring-blue-100 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              The Digital Journal
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-3">
              Explore Ideas &{" "}
              <span className="text-blue-600">Insights</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Stories from creative minds around the world — curated for curious readers.
            </p>
          </div>

          {/* search */}
          <div className="relative max-w-xl mx-auto mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search stories, topics, authors…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              maxLength={50}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm transition-colors w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* category chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* ── Trending ── */}
        {trendingBlogs.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-gray-900 text-xl font-bold tracking-tight">Trending Now</h2>
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 ring-1 ring-orange-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                🔥 Most viewed
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trendingBlogs.map((blog, i) => (
                <TrendingCard key={blog._id} blog={blog} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs font-medium tracking-wider uppercase px-2">Latest Stories</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ── Latest ── */}
        <section>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-gray-900 text-xl font-bold tracking-tight">
                {search ? `Results for "${search}"` : "All Stories"}
              </h2>
              <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2.5 py-1 rounded-full">
                {filteredBlogs.length}
              </span>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
              >
                Clear search
                <span className="text-xs">✕</span>
              </button>
            )}
          </div>

          {/* empty state */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-800 text-base font-semibold mb-1">No stories found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search term or selecting a different category</p>
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed bg-white border border-gray-100"
                  : "text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 shadow-sm"
              }`}
            >
              ← Prev
            </button>

            <div className="flex gap-1.5 flex-wrap justify-center">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed bg-white border border-gray-100"
                  : "text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 shadow-sm"
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