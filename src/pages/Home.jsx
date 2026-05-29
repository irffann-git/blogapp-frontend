import { useEffect, useState } from "react";
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

// category colors - vibrant modern palette
const categoryColors = {
  Technology: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
  Lifestyle: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Sports: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  Programming: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Business: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  Travel: "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200",
  Health: "bg-teal-100 text-teal-700 ring-1 ring-teal-200",
  Productivity: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
  default: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

// ✅ helper — works for both Cloudinary (full URL) and old local uploads (relative path)
function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// blog card - modern card with hover effects
function BlogCard({ blog }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const categoryClass = categoryColors[blog.category] || categoryColors.default;

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col backdrop-blur-sm border border-white/50"
    >
      {/* gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
      
      <div className="relative overflow-hidden h-56 lg:h-64">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        {/* category badge floating */}
        <div className="absolute top-4 left-4 z-20">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm ${categoryClass}`}>
            {blog.category}
          </span>
        </div>
        {/* view count overlay */}
        <div className="absolute bottom-4 right-4 z-20 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-white text-xs font-medium">{blog.views || 0}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow relative z-10 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
          </div>
          <p className="text-sm font-medium text-gray-700 truncate">
            {blog.user?.name || "Anonymous"}
          </p>
        </div>
        
        <h2 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
          {blog.title}
        </h2>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
          {blog.description?.slice(0, 100)}...
        </p>
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
            Read article
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
          <div className="flex items-center gap-1 text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">5 min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// home
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
            </div>
          </div>
          <p className="mt-6 text-indigo-600 font-semibold tracking-wide">Loading amazing stories...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* animated hero section */}
      <div className="relative overflow-hidden bg-white">
        {/* animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-semibold text-indigo-700 tracking-wide">Welcome to BlogSphere</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Where Ideas
              </span>
              <br />
              <span className="text-gray-900">Come to Life</span>
            </h1>
            
            <p className="text-gray-600 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of readers exploring thought-provoking articles from creative minds around the world
            </p>

            {/* search bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search articles, topics, or authors..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                maxLength={50}
                className="w-full pl-12 pr-24 py-4 rounded-2xl bg-white border border-gray-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-gray-900 placeholder-gray-400 shadow-lg"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* category filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 scale-105"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 64L60 69.3C120 75 240 85 360 85.3C480 86 600 75 720 69.3C840 64 960 64 1080 69.3C1200 75 1320 86 1380 90.7L1440 96V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V64Z" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#f9fafb" stopOpacity="0" />
                <stop offset="1" stopColor="#f9fafb" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* content section */}
      <div className="max-w-7xl mx-auto px-4 py-16 lg:py-20">
        {/* trending section */}
        {trendingBlogs.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/>
                    <path d="M4.5 8a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5zM15.5 8a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Trending Now</h2>
                  <p className="text-gray-500 text-sm mt-1">Most popular reads this week</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-orange-600">
                <span className="text-sm font-medium">Hot</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.413.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05c-1.06 1.06-1.537 2.713-1.537 4.242 0 2.54.997 5.023 2.692 6.812A7.012 7.012 0 0010 19c1.623 0 3.184-.551 4.396-1.523 1.214-.973 2.065-2.343 2.458-3.926.393-1.583.215-3.257-.508-4.709-.727-1.456-1.882-2.679-3.29-3.465-.862-.48-1.8-.792-2.67-.956.085.598.083 1.266-.035 1.925-.125.694-.39 1.38-.677 1.935-.292.564-.612.97-.82 1.183a.5.5 0 01-.753-.065c-.264-.35-.44-.831-.562-1.346-.12-.51-.17-1.095-.141-1.681z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingBlogs.map((blog, index) => (
                <div key={blog._id} className="relative">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                    {index + 1}
                  </div>
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-gray-200 my-12" />

        {/* latest blogs section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {search ? `Search Results` : "Latest Articles"}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {search ? `Found ${filteredBlogs.length} articles` : `Discover fresh content daily`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 rounded-full px-3 py-1.5">
                <span className="text-sm font-medium text-gray-600">{filteredBlogs.length} posts</span>
              </div>
            </div>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 text-lg font-medium mb-1">No articles found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or category filter</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          )}
        </section>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm"
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
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-300 ${
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm"
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

      {/* add custom animation styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Home;