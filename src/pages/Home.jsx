import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";


const C = {
  bg:         "#faf7f0",
  card:       "#fffdf7",
  gold:       "#c9a84c",
  goldLight:  "#e8c97a",
  goldDark:   "#9a7530",
  text:       "#3a3020",
  muted:      "#8a7a5a",
  border:     "#e8dfc8",
  heroBg:     "#1e1a10",
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// ── Animated Counter ──────────────────────────────────────────────────────
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1600, 1);
      setCount(Math.floor(p * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, visible]);
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ── Blog Card ─────────────────────────────────────────────────────────────
function BlogCard({ blog, rank }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const cardRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Link to={`/blogs/${blog._id}`} className="block group">
      <div
        ref={cardRef}
        style={{
          opacity: 0,
          transform: "translateY(16px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
        className="hover:shadow-lg"
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
          {/* Gold shimmer overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(135deg, ${C.gold}18 0%, transparent 60%)` }}
          />
          {/* Rank badge */}
          {rank != null && (
            <div
              className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: C.gold, color: "#fff" }}
            >
              {rank}
            </div>
          )}
          {/* Category tag */}
          <div
            className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
            style={{ background: C.heroBg, color: C.goldLight, letterSpacing: "0.1em" }}
          >
            {blog.category}
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3
            className="font-semibold leading-snug mb-2 line-clamp-2 text-sm transition-colors group-hover:text-[#9a7530]"
            style={{ color: C.text, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "0.95rem", lineHeight: 1.4 }}
          >
            {blog.title}
          </h3>
          <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: C.muted }}>
            {blog.description?.slice(0, 85)}…
          </p>
          <div className="flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: C.gold, color: "#fff" }}
              >
                {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
              </div>
              <span className="text-[11px] truncate max-w-[80px]" style={{ color: C.muted }}>
                {blog.user?.name || "Anonymous"}
              </span>
            </div>
            <span className="text-[11px] flex items-center gap-1" style={{ color: C.muted }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {(blog.views || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────
function HeroCard({ blog, index, total, onPrev, onNext }) {
  if (!blog) return null;
  const placeholder = "https://placehold.co/1400x600?text=Featured";

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 400 }}>
      <img
        src={getImageUrl(blog.image)}
        alt={blog.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(20,16,6,0.92) 40%, rgba(20,16,6,0.5) 80%, transparent)" }} />
      {/* Gold border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, ${C.gold}, transparent)` }} />

      <div className="relative flex flex-col justify-end p-8 md:p-12" style={{ minHeight: 400 }}>
        <div className="max-w-xl">
          {/* Gold rule + category */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6" style={{ background: C.gold }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.goldLight }}>
              {blog.category}
            </span>
          </div>

          <h1
            className="font-bold leading-tight mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.7rem, 3.5vw, 2.8rem)",
              color: "#faf7f0",
              letterSpacing: "-0.01em",
            }}
          >
            {blog.title}
          </h1>

          <p className="text-sm mb-6 line-clamp-2 leading-relaxed" style={{ color: "#c8b98a" }}>
            {blog.description}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to={`/blogs/${blog._id}`}
              className="px-6 py-2.5 rounded text-sm font-semibold tracking-wide transition-all hover:opacity-90"
              style={{ background: C.gold, color: "#1a1408" }}
            >
              Read Article
            </Link>
            <span className="text-xs" style={{ color: "#8a7a5a" }}>
              {(blog.views || 0).toLocaleString()} views
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute right-5 bottom-5 flex items-center gap-2">
          <button
            onClick={onPrev}
            className="w-8 h-8 rounded flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: "rgba(201,168,76,0.15)", border: `1px solid ${C.gold}40`, color: C.goldLight }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
          </button>
          <span className="text-xs font-mono" style={{ color: C.muted }}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button
            onClick={onNext}
            className="w-8 h-8 rounded flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: "rgba(201,168,76,0.15)", border: `1px solid ${C.gold}40`, color: C.goldLight }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
          </button>
        </div>

        {/* Dots */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{ width: i === index ? 18 : 5, height: 4, background: i === index ? C.gold : C.muted + "60" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────
function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full" style={{ background: C.gold }} />
        <h2
          className="text-base font-semibold uppercase tracking-widest"
          style={{ color: C.text, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem", letterSpacing: "0.14em" }}
        >
          {title}
        </h2>
      </div>
      {count != null && (
        <span className="text-xs" style={{ color: C.muted }}>{count} articles</span>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [heroIndex, setHeroIndex] = useState(0);

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

  const trendingBlogs = [...blogs].sort((a, b) => b.views - a.views).slice(0, 5);

  useEffect(() => {
    if (trendingBlogs.length === 0) return;
    const id = setInterval(() => setHeroIndex(p => (p + 1) % trendingBlogs.length), 6000);
    return () => clearInterval(id);
  }, [trendingBlogs.length]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50" style={{ background: C.bg }}>
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: C.border }} />
          <div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: "transparent", borderTopColor: C.gold }} />
        </div>
        <p className="text-xs uppercase tracking-widest" style={{ color: C.muted }}>Loading…</p>
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
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "Georgia, serif" }}>

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50"
        style={{ background: "rgba(250,247,240,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-5">
          {/* Logo */}
          <div className="shrink-0 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: C.gold }}>
              <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.text, letterSpacing: "0.04em" }}
            >
              The Journal
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: C.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              maxLength={50}
              className="w-full pl-9 pr-8 py-2 text-sm outline-none rounded-lg transition-all"
              style={{
                background: C.bg,
                color: C.text,
                border: `1px solid ${C.border}`,
                fontFamily: "sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = C.gold}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs transition-colors"
                style={{ color: C.muted }}
              >✕</button>
            )}
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-3 ml-auto text-xs" style={{ color: C.muted, fontFamily: "sans-serif" }}>
            <span>{blogs.length} articles</span>
            <span style={{ color: C.border }}>·</span>
            <span>{totalAuthors} authors</span>
            <span style={{ color: C.border }}>·</span>
            <span>{totalViews.toLocaleString()} views</span>
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200"
                  style={{
                    fontFamily: "sans-serif",
                    background: isActive ? C.gold : C.card,
                    color: isActive ? "#1a1408" : C.muted,
                    border: `1px solid ${isActive ? C.gold : C.border}`,
                    letterSpacing: "0.03em",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">

        {/* Hero */}
        {trendingBlogs.length > 0 && (
          <HeroCard
            blog={trendingBlogs[heroIndex]}
            index={heroIndex}
            total={trendingBlogs.length}
            onPrev={() => setHeroIndex(p => (p - 1 + trendingBlogs.length) % trendingBlogs.length)}
            onNext={() => setHeroIndex(p => (p + 1) % trendingBlogs.length)}
          />
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Articles",   value: blogs.length },
            { label: "Authors",    value: totalAuthors },
            { label: "Views",      value: totalViews },
            { label: "Categories", value: categories.length - 1 },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl px-5 py-4 flex flex-col gap-0.5 text-center"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <span
                className="text-2xl font-bold"
                style={{ color: C.gold, fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                <AnimatedCounter value={value} />
              </span>
              <span className="text-[10px] uppercase tracking-widest" style={{ color: C.muted, fontFamily: "sans-serif" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Trending */}
        {trendingBlogs.length > 0 && (
          <section>
            <SectionHeader title="Trending" count={trendingBlogs.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trendingBlogs.map((blog, i) => <BlogCard key={blog._id} blog={blog} rank={i + 1} />)}
            </div>
          </section>
        )}

        {/* Gold divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${C.gold}50, transparent)` }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.gold }} />
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${C.gold}50, transparent)` }} />
        </div>

        {/* Latest */}
        <section>
          <SectionHeader
            title={search ? `"${search}"` : selectedCategory !== "All" ? selectedCategory : "Latest Articles"}
            count={filteredBlogs.length}
          />

          {filteredBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <svg className="w-7 h-7" style={{ color: C.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold" style={{ color: C.text, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem" }}>
                Nothing found
              </p>
              <p className="text-sm" style={{ color: C.muted, fontFamily: "sans-serif" }}>Try a different search or category</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                className="mt-1 px-5 py-2 rounded text-sm font-medium transition-all hover:opacity-80"
                style={{ background: C.gold, color: "#1a1408", fontFamily: "sans-serif" }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentBlogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 pb-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 h-8 rounded text-xs font-medium transition-all disabled:opacity-40"
              style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, fontFamily: "sans-serif" }}
            >
              ← Prev
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="w-8 h-8 rounded text-xs font-medium transition-all"
                  style={{
                    background: currentPage === p ? C.gold : C.card,
                    color: currentPage === p ? "#1a1408" : C.muted,
                    border: `1px solid ${currentPage === p ? C.gold : C.border}`,
                    fontFamily: "sans-serif",
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 h-8 rounded text-xs font-medium transition-all disabled:opacity-40"
              style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, fontFamily: "sans-serif" }}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, marginTop: 48, paddingBlock: 40 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.text, letterSpacing: "0.04em" }}
          >
            The Journal
          </span>
          <div className="flex gap-6 text-xs" style={{ fontFamily: "sans-serif" }}>
            {["About", "Contact", "Terms", "Privacy"].map(l => (
              <a
                key={l}
                href="#"
                className="uppercase tracking-widest transition-colors"
                style={{ color: C.muted }}
                onMouseEnter={e => e.target.style.color = C.gold}
                onMouseLeave={e => e.target.style.color = C.muted}
              >
                {l}
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color: C.muted, fontFamily: "sans-serif" }}>© 2024 The Journal</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}