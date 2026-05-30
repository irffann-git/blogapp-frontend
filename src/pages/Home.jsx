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

function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// Simple Blog Card - 3 column friendly
function BlogCard({ blog }) {
  const cardRef = useRef(null);
  const placeholder = "https://placehold.co/600x400?text=No+Image";

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
        obs.disconnect();
      }
    }, { threshold: 0.05 });
    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Link to={`/blogs/${blog._id}`} className="block group">
      <div
        ref={cardRef}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 opacity-0 translate-y-4"
        style={{ transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
          {/* Category badge */}
          <span className="absolute bottom-3 left-3 px-2 py-1 text-xs font-medium text-white bg-black/60 backdrop-blur-sm rounded-md">
            {blog.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="capitalize">{blog.user?.name || "Anonymous"}</span>
            <span>•</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base leading-snug group-hover:text-gray-600 transition-colors">
            {blog.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
            {blog.description?.slice(0, 100)}…
          </p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path fillRule="evenodd" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" clipRule="evenodd" />
                </svg>
                {(blog.views || 0).toLocaleString()}
              </span>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">Read more →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Hero Section - Simple & Clean
function HeroSection({ featuredBlog }) {
  if (!featuredBlog) return null;
  const placeholder = "https://placehold.co/1400x600?text=Featured+Story";

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900">
      <img
        src={getImageUrl(featuredBlog.image)}
        alt={featuredBlog.title}
        className="w-full h-[450px] object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-full mb-4">
            {featuredBlog.category}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {featuredBlog.title}
          </h1>
          <p className="text-gray-200 text-sm md:text-base mb-6 line-clamp-2">
            {featuredBlog.description}
          </p>
          <Link
            to={`/blogs/${featuredBlog._id}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Read Article
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stats Cards
function StatsGrid({ stats }) {
  const statsItems = [
    { label: "Articles", value: stats.totalArticles, icon: "📄" },
    { label: "Authors", value: stats.totalAuthors, icon: "👥" },
    { label: "Views", value: stats.totalViews, icon: "👁️" },
    { label: "Categories", value: stats.totalCategories, icon: "🏷️" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsItems.map((item, idx) => (
        <div key={idx} className="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm">
          <div className="text-2xl mb-2">{item.icon}</div>
          <div className="text-2xl font-bold text-gray-900">{item.value.toLocaleString()}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// Section Header
function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {count !== undefined && (
        <span className="text-sm text-gray-500">{count} articles</span>
      )}
    </div>
  );
}

// Loading Spinner
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading stories...</p>
      </div>
    </div>
  );
}

// Main Home Component
export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const blogsPerPage = 9; // 3x3 grid
  const debouncedSearch = useDebounce(search, 400);
  
  const categories = ["All", "Technology", "Lifestyle", "Sports", "Programming", "Business", "Travel", "Health", "Productivity"];

  useEffect(() => {
    const controller = new AbortController();
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/api/blogs?search=${encodeURIComponent(debouncedSearch)}`, { 
          signal: controller.signal 
        });
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

  // Get featured blog (most viewed)
  const featuredBlog = blogs.length > 0 
    ? [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0))[0] 
    : null;

  const filteredBlogs = selectedCategory === "All" 
    ? blogs 
    : blogs.filter(b => b.category === selectedCategory);
  
  const totalViews = blogs.reduce((s, b) => s + (b.views || 0), 0);
  const totalAuthors = new Set(blogs.map(b => b.user?._id).filter(Boolean)).size;
  
  const stats = {
    totalArticles: blogs.length,
    totalAuthors: totalAuthors,
    totalViews: totalViews,
    totalCategories: categories.length - 1,
  };

  // Pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4z" />
                    <path d="M8 8h8v8H8z" fill="white" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">Plain Blog</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center gap-4 text-sm text-gray-500">
              <span>{blogs.length} articles</span>
              <span>•</span>
              <span>{totalAuthors} authors</span>
              <span>•</span>
              <span>{totalViews.toLocaleString()} views</span>
            </div>
          </div>

          {/* Categories */}
          <div className="py-3 overflow-x-auto scrollbar-hide border-t border-gray-100">
            <div className="flex gap-2">
              {categories.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                      ${isActive 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Hero Section */}
        {featuredBlog && <HeroSection featuredBlog={featuredBlog} />}

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Blog Grid - 3 Columns */}
        <section>
          <SectionHeader 
            title={search ? `Search: "${search}"` : selectedCategory !== "All" ? selectedCategory : "All Stories"}
            count={filteredBlogs.length}
          />

          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or category filter</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* 3 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBlogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors
                            ${currentPage === pageNum
                              ? 'bg-gray-900 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Plain Blog</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">About</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            </div>
            <p className="text-sm text-gray-400">© 2024 Plain Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}