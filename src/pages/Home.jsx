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

// category colors – only red-100 for all (small touch)
const categoryColors = {
  Technology: "bg-red-100 text-red-800",
  Lifestyle: "bg-red-100 text-red-800",
  Sports: "bg-red-100 text-red-800",
  Programming: "bg-red-100 text-red-800",
  Business: "bg-red-100 text-red-800",
  Travel: "bg-red-100 text-red-800",
  Health: "bg-red-100 text-red-800",
  Productivity: "bg-red-100 text-red-800",
  default: "bg-red-100 text-red-800",
};

// ✅ helper – unchanged
function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// BlogCard – with red-100 category tag and subtle red hover on title
function BlogCard({ blog }) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  const categoryClass = categoryColors[blog.category] || categoryColors.default;

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      <div className="relative overflow-hidden h-52 sm:h-56">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${categoryClass}`}>
          {blog.category}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800 group-hover:text-red-600 transition-colors">
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
          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold">
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

// Main Home component – white background, only red-100 small accents
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

  // loading state – white background, red-100 spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-red-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-400 rounded-full animate-spin border-t-transparent"></div>
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
    <div className="min-h-screen bg-white">
      {/* Hero Section – white with light red-100 border/bg */}
      <div className="bg-white border-b border-red-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="text-sm font-semibold tracking-widest text-red-400 uppercase mb-3">
            Discover & Learn
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight text-gray-900">
            Explore <span className="text-red-500">Ideas & Insights</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Stories from creative minds around the world – curated for you.
          </p>

          {/* Search bar – white, subtle red focus ring */}
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
              className="w-full pl-11 pr-4 py-3 sm:py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-sm sm:text-base"
            />
          </div>

          {/* Category filters – red-100 for active, white/red-50 for others */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-red-100 text-red-800 shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Trending Section – red-100 badge */}
        {trendingBlogs.length > 0 && (
          <section className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Trending Now</h2>
              </div>
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-4 py-1.5 rounded-full">
                Most viewed this week
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {trendingBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          </section>
        )}

        <div className="border-t border-gray-100 my-10" />

        {/* Latest Blogs Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {search ? `🔍 Search: "${search}"` : "📖 Latest Stories"}
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {filteredBlogs.length} result{filteredBlogs.length !== 1 && "s"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
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

        {/* Pagination – red-100 active page */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
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
                      ? "bg-red-100 text-red-800 shadow-sm"
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
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
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