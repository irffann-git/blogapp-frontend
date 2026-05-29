import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

// debounce hook (unchanged)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// category colors – preserved, only enhanced with new gradients
const categoryColors = {
  Technology: "bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800",
  Lifestyle: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800",
  Sports: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800",
  Programming: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800",
  Business: "bg-gradient-to-r from-stone-100 to-neutral-100 text-stone-800",
  Travel: "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800",
  Health: "bg-gradient-to-r from-lime-100 to-green-100 text-lime-800",
  Productivity: "bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800",
  default: "bg-gray-100 text-gray-700",
};

// ✅ helper – unchanged
function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// BlogCard – redesigned with modern glassmorphic card, better hover, and preserved image/avatar logic
function BlogCard({ blog }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const categoryClass = categoryColors[blog.category] || categoryColors.default;

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-gray-100"
    >
      <div className="relative overflow-hidden h-52 sm:h-56">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${categoryClass}`}>
          {blog.category}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800 group-hover:text-indigo-600 transition-colors">
          {blog.title}
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>👁 {blog.views || 0} views</span>
          <span>•</span>
          <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
          {blog.description?.slice(0, 110)}...
        </p>
        <div className="flex items-center mt-auto pt-3 border-t border-gray-100">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
          </div>
          <p className="text-xs text-gray-500 ml-2 truncate">
            {blog.user?.name || "Anonymous"}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Main Home component – all logic preserved, design fully revamped
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

  // loading state – new animated spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-5 text-gray-500 font-medium">Loading stories...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section – fresh gradient, animated underline, better spacing */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="text-sm font-semibold tracking-widest text-indigo-200 uppercase mb-3">
            Discover & Learn
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
            Explore <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-200">Ideas & Insights</span>
          </h1>
          <p className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Stories from creative minds around the world – curated for you.
          </p>

          {/* Search bar – modern glass style */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, category, or content..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              maxLength={50}
              className="w-full pl-11 pr-4 py-3 sm:py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-sm sm:text-base"
            />
          </div>

          {/* Category filters – modern pill design */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-white text-indigo-900 shadow-lg scale-105"
                    : "bg-white/10 text-gray-200 hover:bg-white/20 hover:text-white backdrop-blur-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {/* decorative blur */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Trending Section – with decorative badge */}
        {trendingBlogs.length > 0 && (
          <section className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Trending Now</h2>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
                Most viewed this week
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {trendingBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          </section>
        )}

        <div className="border-t border-gray-200 my-10" />

        {/* Latest Blogs Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {search ? `🔍 Search: "${search}"` : "📖 Latest Stories"}
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredBlogs.length} result{filteredBlogs.length !== 1 && "s"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No blogs found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {currentBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          )}
        </section>

        {/* Pagination – redesigned with nicer buttons */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm"
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white shadow-md scale-105"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm"
              }`}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;