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

// category colors - professional palette
const categoryColors = {
  Technology: "bg-blue-50 text-blue-700 border-l-2 border-blue-500",
  Lifestyle: "bg-teal-50 text-teal-700 border-l-2 border-teal-500",
  Sports: "bg-red-50 text-red-700 border-l-2 border-red-500",
  Programming: "bg-amber-50 text-amber-700 border-l-2 border-amber-500",
  Business: "bg-slate-50 text-slate-700 border-l-2 border-slate-500",
  Travel: "bg-cyan-50 text-cyan-700 border-l-2 border-cyan-500",
  Health: "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500",
  Productivity: "bg-violet-50 text-violet-700 border-l-2 border-violet-500",
  default: "bg-gray-50 text-gray-600 border-l-2 border-gray-400",
};

// ✅ helper — works for both Cloudinary (full URL) and old local uploads (relative path)
function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// animated counter component
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const duration = 2000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [value, isVisible]);

  return <span ref={countRef}>{count.toLocaleString()}</span>;
}

// blog card with advanced animations
function BlogCard({ blog, index }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const categoryClass = categoryColors[blog.category] || categoryColors.default;
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.disconnect();
        }
      },
      { threshold: 0.1, delay: index * 100 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div
      ref={cardRef}
      className="opacity-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered ? `perspective(1000px) rotateX(2deg) rotateY(2deg)` : 'none',
        transition: 'transform 0.3s ease-out'
      }}
    >
      <Link
        to={`/blogs/${blog._id}`}
        className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 relative"
      >
        {/* animated gradient overlay on hover */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:via-indigo-500/10 group-hover:to-indigo-500/5 transition-all duration-500 z-10 pointer-events-none"
          style={{
            background: isHovered ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(99,102,241,0.1) 0%, transparent 50%)` : 'none'
          }}
        />
        
        <div className="relative overflow-hidden h-52 lg:h-60 bg-gray-100">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* category badge */}
          <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-r-lg text-xs font-semibold shadow-lg transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-300 ${categoryClass.split(' ').slice(0, 2).join(' ')}`}>
            {blog.category}
          </div>

          {/* view count overlay */}
          <div className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-white text-sm font-medium">{blog.views || 0}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{blog.user?.name || "Anonymous"}</p>
              <p className="text-xs text-gray-400">Author</p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
            {blog.title}
          </h2>
          
          <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
            {blog.description?.slice(0, 120)}...
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>5 min read</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm group-hover:gap-3 transition-all duration-300">
              <span>Read More</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// home
function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  const blogsPerPage = 12;
  const debouncedSearch = useDebounce(search, 500);

  const categories = [
    "All", "Technology", "Lifestyle", "Sports", "Programming",
    "Business", "Travel", "Health", "Productivity",
  ];

  // ✅ async function defined INSIDE useEffect — no useCallback needed
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

  // parallax effect for hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset;
        heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading amazing content...</p>
          <div className="mt-2 flex gap-1 justify-center">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === selectedCategory);

  const trendingBlogs = [...blogs].sort((a, b) => b.views - a.views).slice(0, 3);
  const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
  const totalAuthors = new Set(blogs.map(b => b.user?._id).filter(Boolean)).size;

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* hero section with parallax */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        <div ref={heroRef} className="absolute inset-0 opacity-20">
          <div
  className="absolute inset-0 bg-repeat"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  }}
/>
          <div className="absolute top-0 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium tracking-wide">Join 10,000+ readers</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Where <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Knowledge</span> Meets
              <br />
              Inspiration
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover thought-provoking articles, expert insights, and stories that matter. Join our community of curious minds.
            </p>

            {/* animated search bar */}
            <div className="relative max-w-2xl mx-auto mb-8 group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search articles, topics, or authors..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                maxLength={50}
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-xl"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* category filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === cat
                      ? "bg-white text-indigo-600 shadow-lg scale-105"
                      : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 64L60 69.3C120 75 240 85 360 85.3C480 86 600 75 720 69.3C840 64 960 64 1080 69.3C1200 75 1320 86 1380 90.7L1440 96V120H0V64Z" fill="#f9fafb" />
          </svg>
        </div>
      </div>

      {/* stats section with animated counters */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                <AnimatedCounter value={blogs.length} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Articles</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                <AnimatedCounter value={totalAuthors} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Authors</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                <AnimatedCounter value={totalViews} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Total Views</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                <AnimatedCounter value={categories.length - 1} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="max-w-7xl mx-auto px-4 py-16 lg:py-20">
        {/* trending section */}
        {trendingBlogs.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">🔥 Trending Now</h2>
                <p className="text-gray-500 mt-1">Most popular articles this week</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-orange-600">Updated daily</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingBlogs.map((blog, index) => (
                <div key={blog._id} className="relative">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg z-10 animate-pulse">
                    {index + 1}
                  </div>
                  <BlogCard blog={blog} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-gray-200 my-12" />

        {/* latest blogs section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="animate-fade-in-up">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {search ? `Search Results` : "Latest Articles"}
              </h2>
              <p className="text-gray-500 mt-1">
                {search ? `Found ${filteredBlogs.length} articles matching "${search}"` : "Fresh content from our community"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 rounded-full px-4 py-2">
                <span className="text-sm font-medium text-gray-600">{filteredBlogs.length} posts</span>
              </div>
            </div>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 text-lg font-medium mb-1">No articles found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or category filter</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBlogs.map((blog, index) => (
                <BlogCard key={blog._id} blog={blog} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* pagination with animation */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-16 animate-fade-in-up">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm hover:shadow"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex gap-2">
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
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm hover:shadow"
              }`}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-400 text-sm">© 2024 BlogSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default Home;