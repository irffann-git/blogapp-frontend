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

// category colors - Netflix theme
const categoryColors = {
  Technology: "bg-red-600/90 text-white",
  Lifestyle: "bg-rose-600/90 text-white",
  Sports: "bg-orange-600/90 text-white",
  Programming: "bg-purple-600/90 text-white",
  Business: "bg-gray-700/90 text-white",
  Travel: "bg-sky-600/90 text-white",
  Health: "bg-emerald-600/90 text-white",
  Productivity: "bg-indigo-600/90 text-white",
  default: "bg-gray-700/90 text-white",
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

// blog card - Netflix style with dramatic hover (fixed - removed unused isHovered)
function BlogCard({ blog, index }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const categoryClass = categoryColors[blog.category] || categoryColors.default;
  const cardRef = useRef(null);

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

  return (
    <div
      ref={cardRef}
      className="opacity-0"
    >
      <div className="relative group cursor-pointer">
        <Link to={`/blogs/${blog._id}`}>
          {/* Netflix-style image container */}
          <div className="relative overflow-hidden rounded-md aspect-[2/3] sm:aspect-video">
            <img
              src={getImageUrl(blog.image)}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
            />
            
            {/* gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Netflix-style top badge */}
            <div className="absolute top-0 left-0 z-20">
              <div className={`${categoryClass} px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-lg`}>
                {blog.category}
              </div>
            </div>

            {/* view count badge */}
            <div className="absolute top-0 right-0 z-20 bg-black/70 backdrop-blur-sm px-2 py-1 m-2 rounded text-xs font-semibold flex items-center gap-1">
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span className="text-white">{blog.views || 0}</span>
            </div>

            {/* Netflix-style hover info panel */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black via-black/90 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                  {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
                </div>
                <p className="text-xs text-gray-300 truncate">
                  {blog.user?.name || "Anonymous"}
                </p>
              </div>
              
              <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">
                {blog.title}
              </h3>
              
              <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                {blog.description?.slice(0, 80)}...
              </p>
              
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-500 font-bold">92% Match</span>
                <span className="text-gray-400">5 min</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Netflix-style hero carousel item
function HeroSlide({ blog }) {
  const placeholder = "https://placehold.co/1920x800?text=Featured";
  
  return (
    <div className="relative h-[70vh] min-h-[500px] w-full">
      <img
        src={getImageUrl(blog.image)}
        alt={blog.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded">
              Trending Now
            </span>
            <span className="text-green-500 text-sm font-bold">#1 in Blogs Today</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {blog.title}
          </h1>
          
          <p className="text-gray-300 text-base sm:text-lg mb-6 max-w-xl line-clamp-3">
            {blog.description}
          </p>
          
          <div className="flex items-center gap-4">
            <Link
              to={`/blogs/${blog._id}`}
              className="bg-white text-black px-6 py-2.5 rounded font-semibold hover:bg-gray-200 transition-all flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </Link>
            <button className="bg-gray-600/70 hover:bg-gray-600 text-white px-6 py-2.5 rounded font-semibold transition-all flex items-center gap-2 text-sm sm:text-base backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
              </svg>
              More Info
            </button>
          </div>
          
          <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
            <span>{blog.views || 0} views</span>
            <span>•</span>
            <span>{blog.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// home - Netflix theme
function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [heroIndex, setHeroIndex] = useState(0);
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

  // Auto-rotate hero
  useEffect(() => {
    if (trendingBlogs.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % trendingBlogs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [trendingBlogs.length]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-gray-400 font-medium tracking-wide">Loading Netflix-style experience...</p>
        </div>
      </div>
    );
  }

  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === selectedCategory);

  const trendingBlogs = [...blogs].sort((a, b) => b.views - a.views).slice(0, 5);
  const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
  const totalAuthors = new Set(blogs.map(b => b.user?._id).filter(Boolean)).size;

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  return (
    <div className="min-h-screen bg-black">
      {/* Netflix-style hero carousel */}
      {trendingBlogs.length > 0 && (
        <div className="relative">
          <HeroSlide blog={trendingBlogs[heroIndex]} />
          
          {/* hero indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {trendingBlogs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  heroIndex === idx ? "w-8 bg-red-600" : "w-4 bg-gray-600 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 -mt-20">
        {/* Categories row - Netflix style */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white"
                    : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar - Netflix style */}
        <div className="bg-gradient-to-r from-red-600/10 via-black to-red-600/10 border-y border-gray-800 mb-8">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div ref={statsRef} className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  <AnimatedCounter value={blogs.length} />
                </div>
                <p className="text-xs text-gray-400">ARTICLES</p>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  <AnimatedCounter value={totalAuthors} />
                </div>
                <p className="text-xs text-gray-400">AUTHORS</p>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  <AnimatedCounter value={totalViews} />
                </div>
                <p className="text-xs text-gray-400">VIEWS</p>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  <AnimatedCounter value={categories.length - 1} />
                </div>
                <p className="text-xs text-gray-400">CATEGORIES</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar - Netflix style */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search titles, categories..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              maxLength={50}
              className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content rows - Netflix style rows */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Trending row */}
          {trendingBlogs.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  🔥 Trending Now
                </h2>
                <button className="text-sm text-gray-400 hover:text-white transition-colors">
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {trendingBlogs.slice(0, 5).map((blog, index) => (
                  <div key={blog._id} className="relative">
                    <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                    <BlogCard blog={blog} index={index} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest row */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {search ? `Search Results: "${search}"` : "Latest Releases"}
              </h2>
              <div className="text-sm text-gray-400">
                {filteredBlogs.length} titles
              </div>
            </div>

            {filteredBlogs.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg font-medium mb-1">No results found</p>
                <p className="text-gray-500 text-sm">Try a different search term</p>
                <button
                  onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                  className="mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {currentBlogs.map((blog, index) => (
                  <BlogCard key={blog._id} blog={blog} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination - Netflix style */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 pb-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white"
                }`}
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
                      className={`w-8 h-8 rounded text-sm font-semibold transition-all ${
                        currentPage === pageNum
                          ? "bg-red-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
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
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Netflix-style footer */}
      <footer className="bg-black border-t border-gray-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded"></div>
              <span className="text-xl font-bold text-white tracking-tight">BLOGFLIX</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
            <p className="text-xs text-gray-500">© 2024 BlogFlix. All rights reserved.</p>
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
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
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

export default Home;