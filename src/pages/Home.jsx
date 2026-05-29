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

// category colors
const categoryColors = {
  Technology: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700",
  Lifestyle: "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700",
  Sports: "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700",
  Programming: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700",
  Business: "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700",
  Travel: "bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700",
  Health: "bg-gradient-to-r from-lime-50 to-green-50 text-lime-700",
  Productivity: "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700",
  default: "bg-gradient-to-r from-stone-100 to-neutral-100 text-stone-600",
};

// ✅ helper — works for both Cloudinary (full URL) and old local uploads (relative path)
function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// blog card
function BlogCard({ blog }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const categoryClass = categoryColors[blog.category] || categoryColors.default;

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col border border-gray-100 hover:border-amber-200"
    >
      <div className="relative overflow-hidden h-52 sm:h-56 lg:h-60">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm ${categoryClass}`}>
            {blog.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
            </div>
            <p className="text-xs text-gray-500 font-medium truncate">
              {blog.user?.name || "Anonymous"}
            </p>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{blog.views || 0}</span>
          </div>
        </div>
        <h2 className="text-base font-bold mb-2 line-clamp-2 text-gray-800 group-hover:text-amber-600 transition-colors leading-snug">
          {blog.title}
        </h2>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
          {blog.description?.slice(0, 120)}...
        </p>
        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-amber-600 font-medium group-hover:text-amber-700">
          <span>Read more</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-100 border-t-amber-500 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-amber-500 rounded-full animate-ping" />
            </div>
          </div>
          <p className="mt-6 text-amber-700 font-medium tracking-wide">Gathering stories...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30">
      {/* hero */}
      <div className="relative bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <span className="text-xs font-medium text-amber-200 tracking-wide">Discover stories</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent leading-tight">
              Explore ideas & insights
            </h1>
            <p className="text-stone-300 text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Stories from creative minds around the world
            </p>

            <div className="relative max-w-xl mx-auto">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, category, or content..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                maxLength={50}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/95 backdrop-blur-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base shadow-lg"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                      : "bg-white/10 text-stone-200 hover:bg-white/20 hover:text-amber-200 backdrop-blur-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50/30 to-transparent" />
      </div>

      {/* content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-20">

        {/* trending */}
        {trendingBlogs.length > 0 && (
          <section className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Trending now</h2>
              </div>
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/>
                  <path d="M4.5 8a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5zM15.5 8a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5z"/>
                  <path d="M10 13.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5z"/>
                </svg>
                Top viewed
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingBlogs.map((blog, idx) => (
                <div key={blog._id} className="relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                    {idx + 1}
                  </div>
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-stone-200/60 my-12" />

        {/* latest */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-stone-600 to-stone-800 rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">
                {search ? `Search: "${search}"` : "Latest stories"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-stone-500 font-medium bg-white/50 px-3 py-1 rounded-full">
                {filteredBlogs.length} results
              </p>
              {search && (
                <button 
                  onClick={() => setSearch("")} 
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-stone-100">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-stone-100 to-stone-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-stone-600 text-lg font-medium">No blogs match your search</p>
              <p className="text-stone-400 text-sm mt-1">Try another keyword or explore categories</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {currentBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          )}
        </section>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                currentPage === 1
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            <div className="flex gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                currentPage === totalPages
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm"
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
    </div>
  );
}

export default Home;