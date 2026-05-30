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

// Professional Blog Card Component with refined hover effects
function BlogCard({ blog }) {
  const cardRef = useRef(null);
  const placeholder = "https://placehold.co/600x400?text=No+Image";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "20px" }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Link to={`/blogs/${blog._id}`} className="block group">
      <div
        ref={cardRef}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 opacity-0 translate-y-4 border border-gray-100 hover:border-gray-200"
        style={{ transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholder;
            }}
          />
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium text-white bg-gray-900/90 backdrop-blur-sm rounded-md">
            {blog.category}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="font-medium">{blog.user?.name || "Anonymous"}</span>
            <span>•</span>
            <time dateTime={blog.createdAt}>
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base group-hover:text-blue-600 transition-colors">
            {blog.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {blog.description?.slice(0, 100)}…
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path fillRule="evenodd" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" clipRule="evenodd" />
              </svg>
              {(blog.views || 0).toLocaleString()}
            </span>
            <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
              Read more →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader for professional feel
function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-200 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const blogsPerPage = 6;
  const debouncedSearch = useDebounce(search, 400);
  
  const categories = ["All", "Technology", "Lifestyle", "Sports", "Programming", "Business", "Travel", "Health"];

  // Fetch blogs with debounced search
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
        toast.error("Failed to fetch blogs. Please try again.");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
    return () => controller.abort();
  }, [debouncedSearch]);

  // Filter by category
  const filteredBlogs = selectedCategory === "All" 
    ? blogs 
    : blogs.filter(b => b.category === selectedCategory);

  // Trending (top 4 by views)
  const trendingBlogs = [...filteredBlogs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  // Latest blogs sorted by date
  const latestBlogs = [...filteredBlogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = latestBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(latestBlogs.length / blogsPerPage);

  // Helper to change category and reset page
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Helper to change search and reset page
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
{/* ALTERNATIVE HERO - extra lean, almost no background weight */}
<div className="bg-black border-b border-gray-100">
  <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
    <div className="max-w-3xl mx-auto text-center">
      {/* No badge, just clean typography */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
        Explore <span className="text-blue-500">ideas</span> that matter
      </h1>
      <p className="text-gray-500 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-normal">
        Stories from the world's brightest minds on tech, business & lifestyle.
      </p>
      
      {/* Minimal search bar - no shadow, thin border */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-5 py-3 pl-12 pr-10 text-gray-900 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Light category pills - transparent bg */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200
              ${selectedCategory === cat 
                ? 'bg-gray-800 text-white' 
                : 'bg-white/80 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  </div>
</div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Trending Section - only show when no search and blogs exist */}
        {!search && trendingBlogs.length > 0 && !loading && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Trending now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </section>
        )}

        {/* Latest Blogs Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {search ? (
                <>Search results for "<span className="text-blue-600">{search}</span>"</>
              ) : selectedCategory !== "All" ? (
                <>Latest in {selectedCategory}</>
              ) : (
                "Latest articles"
              )}
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">{latestBlogs.length} {latestBlogs.length === 1 ? 'post' : 'posts'}</p>
              {(search || selectedCategory !== "All") && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {loading ? (
            // Skeleton loading grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : currentBlogs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">No articles found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                Browse all articles
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {(() => {
                      const pages = [];
                      let start = Math.max(1, currentPage - 2);
                      let end = Math.min(totalPages, start + 4);
                      
                      if (end - start < 4) {
                        start = Math.max(1, end - 4);
                      }
                      
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }
                      
                      return pages.map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors
                            ${currentPage === page
                              ? 'bg-gray-900 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
      <footer className="bg-white border-t border-gray-100 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Blog. All rights reserved.</p>
          </div>
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