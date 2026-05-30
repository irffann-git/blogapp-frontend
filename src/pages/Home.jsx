import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const categoryAccents = {
  Technology:   "#bdbdbd",
  Lifestyle:    "#c9b49a",
  Sports:       "#a8b8a0",
  Programming:  "#9fb0c4",
  Business:     "#b0a8c4",
  Travel:       "#a4b8c0",
  Health:       "#aec4a4",
  Productivity: "#c4b8a0",
  default:      "#858585",
};

function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

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
      const p = Math.min((ts - start) / 1600, 1);
      setCount(Math.floor(p * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, visible]);
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function BlogCard({ blog, rank }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const accent = categoryAccents[blog.category] || categoryAccents.default;
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
        style={{ opacity: 0, transform: "translateY(18px)", transition: "opacity 0.5s ease, transform 0.5s ease", background: "#2c2c2c", border: "1px solid rgba(255,255,255,0.04)" }}
        className="rounded-xl overflow-hidden hover:border-[#bdbdbd20] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ filter: "grayscale(15%)" }}
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #2c2c2c 0%, transparent 60%)" }} />
          {rank != null && (
            <div className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(44,44,44,0.9)", border: "1px solid rgba(189,189,189,0.2)", color: "#bdbdbd" }}>
              {rank}
            </div>
          )}
          <div className="absolute bottom-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded" style={{ background: "#2c2c2c", color: accent, border: `1px solid ${accent}40`, letterSpacing: "0.15em" }}>
            {blog.category}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold leading-snug mb-2 line-clamp-2 text-sm transition-colors" style={{ color: "#bdbdbd", fontFamily: "Georgia, serif" }}>
            {blog.title}
          </h3>
          <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "#585858" }}>{blog.description?.slice(0, 90)}…</p>
          <div className="flex items-center justify-between text-[11px]" style={{ color: "#585858" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: "#585858", color: "#2c2c2c" }}>
                {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
              </div>
              <span className="truncate max-w-[80px]">{blog.user?.name || "Anonymous"}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
              {(blog.views || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HeroCard({ blog, index, total, onPrev, onNext }) {
  if (!blog) return null;
  const placeholder = "https://placehold.co/1400x600?text=Featured";
  const accent = categoryAccents[blog.category] || categoryAccents.default;
  return (
    <div className="relative rounded-2xl overflow-hidden group" style={{ minHeight: 420 }}>
      <img src={getImageUrl(blog.image)} alt={blog.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105" style={{ filter: "grayscale(25%)" }} onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #1a1a1a 35%, rgba(26,26,26,0.7) 65%, transparent 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,26,26,0.8) 0%, transparent 50%)" }} />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      <div className="relative flex flex-col justify-end p-8 md:p-12" style={{ minHeight: 420 }}>
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: accent }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{blog.category}</span>
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "#585858" }}>— Featured</span>
          </div>
          <h1 className="font-black leading-[1.1] mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(1.8rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", color: "#e8e4dc" }}>
            {blog.title}
          </h1>
          <p className="text-sm md:text-base mb-7 line-clamp-2 max-w-lg leading-relaxed" style={{ color: "#858585" }}>{blog.description}</p>
          <div className="flex items-center gap-4">
            <Link to={`/blogs/${blog._id}`} className="px-6 py-2.5 rounded text-sm font-bold tracking-wide transition-all duration-200 hover:opacity-80" style={{ background: "#e8e4dc", color: "#1a1a1a" }}>
              Read Article
            </Link>
            <span className="text-xs" style={{ color: "#585858" }}>{(blog.views || 0).toLocaleString()} views</span>
          </div>
        </div>

        <div className="absolute right-6 bottom-6 flex items-center gap-2">
          <button onClick={onPrev} className="w-8 h-8 rounded flex items-center justify-center transition-colors" style={{ background: "rgba(44,44,44,0.8)", border: "1px solid rgba(189,189,189,0.15)", color: "#bdbdbd" }}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
          </button>
          <span className="text-xs font-mono" style={{ color: "#585858" }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <button onClick={onNext} className="w-8 h-8 rounded flex items-center justify-center transition-colors" style={{ background: "rgba(44,44,44,0.8)", border: "1px solid rgba(189,189,189,0.15)", color: "#bdbdbd" }}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300" style={{ width: i === index ? 20 : 6, height: 4, background: i === index ? "#e8e4dc" : "#585858" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, count }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full" style={{ background: "#bdbdbd" }} />
        <h2 className="text-base font-black uppercase" style={{ fontFamily: "Georgia, serif", letterSpacing: "0.12em", color: "#bdbdbd" }}>{children}</h2>
      </div>
      {count != null && <span className="text-xs font-mono" style={{ color: "#585858" }}>{count} articles</span>}
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
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 z-50" style={{ background: "#1a1a1a" }}>
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: "#2c2c2c" }} />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#bdbdbd] animate-spin" style={{ borderColor: "transparent", borderTopColor: "#bdbdbd" }} />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.25em]" style={{ color: "#585858" }}>Loading</p>
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
    <div className="min-h-screen" style={{ background: "#1a1a1a", fontFamily: "Georgia, serif" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50" style={{ background: "rgba(26,26,26,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-5">
          <div className="shrink-0 flex items-center gap-2">
            <div className="w-px h-6" style={{ background: "#bdbdbd" }} />
            <span className="text-xl font-black tracking-tight" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em", color: "#e8e4dc" }}>THE BLOG</span>
          </div>
          <div className="hidden md:block h-4 w-px" style={{ background: "rgba(189,189,189,0.12)" }} />
          <div className="flex-1 max-w-sm relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#585858" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              maxLength={50}
              className="w-full pl-9 pr-8 py-2 rounded text-sm outline-none transition-all"
              style={{ background: "#2c2c2c", color: "#bdbdbd", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "sans-serif" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs transition-colors" style={{ color: "#585858" }}>✕</button>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-2 ml-auto text-[11px] font-mono" style={{ color: "#585858" }}>
            <span>{blogs.length} articles</span>
            <span style={{ color: "#3a3a3a" }}>·</span>
            <span>{totalAuthors} authors</span>
            <span style={{ color: "#3a3a3a" }}>·</span>
            <span>{totalViews.toLocaleString()} views</span>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-3">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              const accent = categoryAccents[cat] || "#bdbdbd";
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className="px-3.5 py-1.5 rounded text-xs font-bold whitespace-nowrap uppercase transition-all duration-200"
                  style={{
                    fontFamily: "sans-serif",
                    letterSpacing: "0.1em",
                    background: isActive ? "#2c2c2c" : "transparent",
                    color: isActive ? accent : "#585858",
                    borderBottom: isActive ? `2px solid ${accent}` : "2px solid transparent",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-14">

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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: "Articles", value: blogs.length }, { label: "Authors", value: totalAuthors }, { label: "Views", value: totalViews }, { label: "Categories", value: categories.length - 1 }].map(({ label, value }) => (
            <div key={label} className="rounded-xl px-5 py-4 flex flex-col gap-1" style={{ background: "#2c2c2c", border: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-2xl font-black" style={{ color: "#e8e4dc", fontFamily: "Georgia, serif" }}><AnimatedCounter value={value} /></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#585858", fontFamily: "sans-serif" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Trending */}
        {trendingBlogs.length > 0 && (
          <section>
            <SectionLabel count={trendingBlogs.length}>Trending</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trendingBlogs.map((blog, i) => <BlogCard key={blog._id} blog={blog} rank={i + 1} />)}
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, #2c2c2c, transparent)" }} />
          <div className="w-1 h-1 rounded-full" style={{ background: "#585858" }} />
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, #2c2c2c, transparent)" }} />
        </div>

        {/* Latest */}
        <section>
          <SectionLabel count={filteredBlogs.length}>
            {search ? `"${search}"` : selectedCategory !== "All" ? selectedCategory : "Latest"}
          </SectionLabel>

          {filteredBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#2c2c2c" }}>
                <svg className="w-8 h-8" style={{ color: "#585858" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-bold" style={{ color: "#bdbdbd", fontFamily: "Georgia, serif" }}>Nothing found</p>
              <p className="text-sm" style={{ color: "#585858", fontFamily: "sans-serif" }}>Adjust your search or category filter</p>
              <button onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="mt-2 px-5 py-2 rounded text-sm font-bold transition-all" style={{ background: "#2c2c2c", color: "#bdbdbd", border: "1px solid rgba(189,189,189,0.18)", fontFamily: "sans-serif" }}>
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
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 h-8 rounded text-xs font-bold transition-all disabled:opacity-30" style={{ background: "#2c2c2c", color: "#bdbdbd", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "sans-serif" }}>
              ← Prev
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button key={p} onClick={() => setCurrentPage(p)} className="w-8 h-8 rounded text-xs font-bold transition-all" style={{ background: currentPage === p ? "#e8e4dc" : "#2c2c2c", color: currentPage === p ? "#1a1a1a" : "#585858", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "sans-serif" }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 h-8 rounded text-xs font-bold transition-all disabled:opacity-30" style={{ background: "#2c2c2c", color: "#bdbdbd", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "sans-serif" }}>
              Next →
            </button>
          </div>
        )}
      </main>

      <footer className="mt-12 py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-lg font-black tracking-tight" style={{ fontFamily: "Georgia, serif", color: "#e8e4dc" }}>THE BLOG</span>
          <div className="flex gap-6 text-xs" style={{ fontFamily: "sans-serif" }}>
            {["About", "Contact", "Terms", "Privacy"].map(l => (
              <a key={l} href="#" className="transition-colors uppercase tracking-widest" style={{ color: "#585858" }} onMouseEnter={e => e.target.style.color = "#bdbdbd"} onMouseLeave={e => e.target.style.color = "#585858"}>{l}</a>
            ))}
          </div>
          <p className="text-xs font-mono" style={{ color: "#585858" }}>© 2024 The Blog</p>
        </div>
      </footer>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}