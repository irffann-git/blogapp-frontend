import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

// debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Spotify-style category colors (vibrant album-art palette)
const categoryColors = {
  Technology:   { bg: "#1DB954", text: "#000" },
  Lifestyle:    { bg: "#E91E8C", text: "#fff" },
  Sports:       { bg: "#FF6437", text: "#fff" },
  Programming:  { bg: "#509BF5", text: "#fff" },
  Business:     { bg: "#7358FF", text: "#fff" },
  Travel:       { bg: "#27CDCE", text: "#000" },
  Health:       { bg: "#8EBA42", text: "#000" },
  Productivity: { bg: "#F59B23", text: "#000" },
  default:      { bg: "#535353", text: "#fff" },
};

function getImageUrl(image) {
  const placeholder = "https://placehold.co/400x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// Animated counter
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1800, 1);
      setCount(Math.floor(p * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, visible]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// Spotify-style square card (album art feel)
function BlogCard({ blog, rank }) {
  const placeholder = "https://placehold.co/400x400?text=No+Image";
  const color = categoryColors[blog.category] || categoryColors.default;

  return (
    <Link to={`/blogs/${blog._id}`} className="group block">
      <div className="bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer">
        {/* Square image */}
        <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-xl">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />

          {/* Play button overlay */}
          <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Rank badge */}
          {rank != null && (
            <div className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: color.bg }}>
              {rank}
            </div>
          )}
        </div>

        {/* Text */}
        <h3 className="text-[#fff] font-bold text-sm leading-tight line-clamp-2 mb-1">{blog.title}</h3>
        <p className="text-[#b3b3b3] text-xs line-clamp-2 mb-2">{blog.description?.slice(0, 70)}…</p>

        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: color.bg + "26", color: color.bg }}
          >
            {blog.category}
          </span>
          <span className="text-[#535353] text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {(blog.views || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Featured hero — Spotify "Now Playing" style wide card
function FeaturedHero({ blog, onPrev, onNext, total, current }) {
  const placeholder = "https://placehold.co/1200x600?text=Featured";
  if (!blog) return null;
  const color = categoryColors[blog.category]?.bg || "#1DB954";

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${color}22 0%, #121212 60%)`,
      }}
    >
      {/* Blurred bg image */}
      <div
        className="absolute inset-0 opacity-20 blur-2xl scale-110"
        style={{
          backgroundImage: `url(${getImageUrl(blog.image)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
        {/* Album art */}
        <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-2xl">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: color, color: color === "#1DB954" || color === "#27CDCE" || color === "#8EBA42" || color === "#F59B23" ? "#000" : "#fff" }}
            >
              {blog.category}
            </span>
            <span className="text-[#b3b3b3] text-xs">Featured Article</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 line-clamp-3 tracking-tight">
            {blog.title}
          </h1>

          <p className="text-[#b3b3b3] text-sm md:text-base mb-6 line-clamp-3 max-w-xl">
            {blog.description}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to={`/blogs/${blog._id}`}
              className="flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm text-black transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: color }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Read Now
            </Link>
            <div className="flex items-center gap-1 text-[#b3b3b3] text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {(blog.views || 0).toLocaleString()} views
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <button
            onClick={onPrev}
            className="w-8 h-8 rounded-full bg-[#282828] hover:bg-[#3e3e3e] flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
          </button>
          <span className="text-[#b3b3b3] text-xs font-semibold">{current + 1} / {total}</span>
          <button
            onClick={onNext}
            className="w-8 h-8 rounded-full bg-[#282828] hover:bg-[#3e3e3e] flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Section row header
function SectionHeader({ title, count }) {
  return (
    <div className="flex items-baseline justify-between mb-5">
      <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{title}</h2>
      {count != null && <span className="text-[#b3b3b3] text-sm font-semibold hover:text-white cursor-pointer transition-colors">Show all</span>}
    </div>
  );
}

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  const blogsPerPage = 12;
  const debouncedSearch = useDebounce(search, 400);

  const categories = ["All", "Technology", "Lifestyle", "Sports", "Programming", "Business", "Travel", "Health", "Productivity"];

  useEffect(() => {
    const controller = new AbortController();
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/api/blogs?search=${encodeURIComponent(debouncedSearch)}`, { signal: controller.signal });
        setBlogs(data);
      } catch (error) {
        if (error.name === "AbortError" || error.name === "CanceledError") return;
        toast.error("Failed to fetch blogs");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
    return () => controller.abort();
  }, [debouncedSearch]);

  const trendingBlogs = blogs.length > 0 ? [...blogs].sort((a, b) => b.views - a.views).slice(0, 5) : [];
  useEffect(() => {
    if (trendingBlogs.length === 0) return;
    const interval = setInterval(() => setHeroIndex(p => (p + 1) % trendingBlogs.length), 5000);
    return () => clearInterval(interval);
  }, [trendingBlogs.length]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#121212] flex flex-col items-center justify-center z-50 gap-6">
        <div className="w-14 h-14 relative">
          <div className="absolute inset-0 rounded-full border-4 border-[#1DB954]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#1DB954] animate-spin" />
        </div>
        <p className="text-[#b3b3b3] text-sm font-semibold tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  const filteredBlogs = selectedCategory === "All" ? blogs : blogs.filter(b => b.category === selectedCategory);
  const totalViews = blogs.reduce((s, b) => s + (b.views || 0), 0);
  const totalAuthors = new Set(blogs.map(b => b.user?._id).filter(Boolean)).size;
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  return (
    <div className="min-h-screen bg-[#121212] text-white" style={{ fontFamily: "'Circular', 'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* Sidebar-like top bar */}
      <div className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <svg className="w-8 h-8 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.93V6.07c.33-.05.66-.07 1-.07 3.31 0 6 2.69 6 6s-2.69 6-6 6c-.34 0-.67-.02-1-.07zM5 12c0-2.97 2.16-5.43 5-5.91v11.82C7.16 17.43 5 14.97 5 12z"/>
            </svg>
            <span className="text-lg font-black tracking-tight text-white">BLOGIFY</span>
          </div>

          {/* Search */}
          <div className={`flex-1 max-w-md mx-auto relative transition-all duration-200 ${searchFocused ? "scale-[1.02]" : ""}`}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="What do you want to read?"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              maxLength={50}
              className="w-full pl-10 pr-10 py-2.5 bg-[#2a2a2a] rounded-full text-white placeholder-[#6a6a6a] text-sm outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6a6a] hover:text-white transition-colors text-xs">✕</button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const color = categoryColors[cat]?.bg;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive ? "text-black scale-105" : "bg-[#2a2a2a] text-[#b3b3b3] hover:bg-[#3a3a3a] hover:text-white"
                  }`}
                  style={isActive ? { background: color || "#1DB954" } : {}}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

        {/* Hero */}
        {trendingBlogs.length > 0 && (
          <FeaturedHero
            blog={trendingBlogs[heroIndex]}
            current={heroIndex}
            total={trendingBlogs.length}
            onPrev={() => setHeroIndex(p => (p - 1 + trendingBlogs.length) % trendingBlogs.length)}
            onNext={() => setHeroIndex(p => (p + 1) % trendingBlogs.length)}
          />
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Articles", value: blogs.length },
            { label: "Authors", value: totalAuthors },
            { label: "Total Views", value: totalViews },
            { label: "Categories", value: categories.length - 1 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[#1DB954]"><AnimatedCounter value={value} /></div>
              <div className="text-[#b3b3b3] text-xs font-semibold mt-1 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>

        {/* Trending row */}
        {trendingBlogs.length > 0 && (
          <section>
            <SectionHeader title="🔥 Trending Now" count={trendingBlogs.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trendingBlogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Latest / search results */}
        <section>
          <SectionHeader
            title={search ? `Results for "${search}"` : selectedCategory !== "All" ? selectedCategory : "Latest Articles"}
            count={filteredBlogs.length}
          />

          {filteredBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#282828] flex items-center justify-center">
                <svg className="w-10 h-10 text-[#535353]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white font-bold text-lg">No results found</p>
              <p className="text-[#b3b3b3] text-sm">Try a different search or category</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                className="mt-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-[#e0e0e0] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pb-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-full bg-[#282828] disabled:opacity-30 hover:bg-[#3a3a3a] flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${currentPage === pageNum ? "bg-white text-black scale-110" : "bg-[#282828] text-[#b3b3b3] hover:bg-[#3a3a3a] hover:text-white"}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-full bg-[#282828] disabled:opacity-30 hover:bg-[#3a3a3a] flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.93V6.07c.33-.05.66-.07 1-.07 3.31 0 6 2.69 6 6s-2.69 6-6 6c-.34 0-.67-.02-1-.07zM5 12c0-2.97 2.16-5.43 5-5.91v11.82C7.16 17.43 5 14.97 5 12z"/>
            </svg>
            <span className="font-black text-white tracking-tight">BLOGIFY</span>
          </div>
          <div className="flex gap-6 text-sm text-[#b3b3b3]">
            {["About", "Contact", "Terms", "Privacy"].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs text-[#535353]">© 2024 Blogify. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}