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

// Blog Card Component
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
        className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-all duration-300 opacity-0 translate-y-4"
        style={{ transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded">
            {blog.category}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span>{blog.user?.name || "Anonymous"}</span>
            <span>•</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base">
            {blog.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {blog.description?.slice(0, 100)}…
          </p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path fillRule="evenodd" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" clipRule="evenodd" />
              </svg>
              {(blog.views || 0).toLocaleString()}
            </span>
            <span className="text-gray-900">Read more →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Hero Section
function HeroSection({ blog }) {
  const placeholder = "https://placehold.co/1200x500?text=Featured+Post";

  if (!blog) return null;

  return (
    <Link to={`/blogs/${blog._id}`} className="block group mb-12">
      <div className="relative rounded-xl overflow-hidden bg-gray-900">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-96 object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-900 rounded mb-3">
            {blog.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{blog.title}</h1>
          <p className="text-gray-200 text-sm md:text-base max-w-2xl mb-3">
            {blog.description?.slice(0, 150)}…
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span>{blog.user?.name || "Anonymous"}</span>
            <span>•</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{blog.views || 0} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Loading Spinner
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const debouncedSearch = useDebounce(search, 400);
  
  const categories = ["All", "Technology", "Lifestyle", "Sports", "Programming", "Business", "Travel", "Health"];

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

  const filteredBlogs = selectedCategory === "All" 
    ? blogs 
    : blogs.filter(b => b.category === selectedCategory);

  // Featured blog (first one or most viewed)
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;

  // Latest blogs (newest first, exclude featured for latest section)
  const latestBlogs = [...filteredBlogs]
    .filter(b => b._id !== featuredBlog?._id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-gray-900">
              BlogName
            </Link>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500"
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

          {/* Categories */}
          <div className="mt-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-sm rounded-md whitespace-nowrap transition-colors
                    ${selectedCategory === cat 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Hero Section */}
        {featuredBlog && !search && selectedCategory === "All" && (
          <HeroSection blog={featuredBlog} />
        )}

        {/* Blog Grid - 3 Columns */}
        {latestBlogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No articles found.</p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {search ? `Search results for "${search}"` : selectedCategory !== "All" ? selectedCategory : "Latest Posts"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestBlogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2024 BlogName. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}